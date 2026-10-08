class LightingControlCard extends HTMLElement {
  setConfig(config) {
    if (config?.type !== "custom:lighting-control-card") throw Error("Invalid card");
    this._config=config;
    if (!this._initialized) this._init();
  }
  _init() {
    this._initialized=true;
    this._selected="light.koridor_2";
    this._catalog=[];
    this._busy=false;
    this._blinkStop=false;
    const root=this.attachShadow({mode:"open"});
    root.innerHTML=`
      <style>
      :host{display:block;color:var(--primary-text-color)}
      ha-card{border-radius:18px;overflow:hidden}
      .inner{padding:20px;display:grid;gap:12px}
      h2{font-size:19px;margin:0;letter-spacing:-.02em}
      .subtitle{font-size:13px;color:var(--secondary-text-color);line-height:1.45}
      label{font-size:13px;font-weight:600}
      input,select{padding:12px;width:100%;box-sizing:border-box;border:1px solid var(--divider-color);border-radius:12px;background:var(--card-background-color);color:var(--primary-text-color);font:inherit}
      .info{background:var(--secondary-background-color);padding:14px;border-radius:12px}
      .name{font-size:17px;font-weight:650;overflow-wrap:anywhere}
      .meta{font-size:12px;color:var(--secondary-text-color);overflow-wrap:anywhere}
      .state{font-weight:600;padding:8px 0}
      .buttons{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      button{border:1px solid var(--divider-color);padding:12px;border-radius:12px;font:inherit;background:var(--card-background-color);color:var(--primary-text-color)}
      button.primary{background:var(--primary-color);color:var(--text-primary-color,#fff)}
      button:disabled{opacity:.45}
      .notice{border-left:3px solid var(--warning-color,#de9e32);padding:8px 12px;background:var(--secondary-background-color);border-radius:8px;font-size:12px}
      </style>
      <ha-card><div class="inner">
        <h2>Освещение · управление и редактирование</h2>
        <div class="subtitle">Текущее состояние из Home Assistant · каталог реестра для выбора устройства</div>
        <button id="refresh">↻ Обновить список устройств</button><div id="count" class="subtitle"></div><label for="filter">Поиск</label><input id="filter" placeholder="Название или идентификатор"/>
        <label for="device">Светильник</label><select id="device"></select>
        <div class="info"><div id="name" class="name"></div><div id="id" class="meta"></div><div id="meta" class="meta"></div><div id="state" class="state"></div></div>
        <label for="alias">Название в мастере</label>
        <input id="alias" maxlength="80" placeholder="Например: подсветка коридора"/>
        <div class="buttons"><button class="primary" id="on">Включить</button><button id="off">Выключить</button></div>
        <button id="details">Расширенное управление (яркость, цвет, эффекты)</button>
        <div class="buttons"><button id="identify">Идентифицировать · 8 с</button><button id="stop" disabled>Стоп</button></div>
        <label for="zone">Зона / помещение</label>
        <select id="zone"><option value="">Загрузка зон…</option></select>
        <label for="description">Описание и назначение</label>
        <input id="description" maxlength="120" placeholder="Например: LED-подсветка потолка"/>
        <button id="save">Сохранить предварительную регистрацию</button>
        <div id="registration" class="subtitle"></div>
        <div class="notice" id="policy">Ручное управление доступно для всех светильников с актуальным состоянием on/off. Группы могут воздействовать на несколько устройств.</div>
        <div id="result" class="subtitle" role="status" aria-live="polite"></div>
      </div></ha-card>`;
    this._root=root;
    root.getElementById("filter").addEventListener("input",()=>this._options());
    root.getElementById("device").addEventListener("change",e=>{this._selected=e.target.value;this._loadReview();this._render();});
    root.getElementById("on").addEventListener("click",()=>this._operate("turn_on"));
    root.getElementById("off").addEventListener("click",()=>this._operate("turn_off"));
    root.getElementById("identify").addEventListener("click",()=>this._identify());
    root.getElementById("stop").addEventListener("click",()=>{this._blinkStop=true;});
    root.getElementById("save").addEventListener("click",()=>this._saveReview());
    root.getElementById("details").addEventListener("click",()=>{if(this._hass?.states?.[this._selected])this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this._selected},bubbles:true,composed:true}));});
    root.getElementById("refresh").addEventListener("click",()=>this._refresh());
    this._loadAreas();
    this._refresh();
  }
  set hass(hass){this._hass=hass;if(this._initialized)this._render();}
  async _loadAreas(){
    try{
      const r=await fetch("/local/lighting-commissioning/areas.json?t="+Date.now(),{cache:"no-store"});
      if(!r.ok)throw Error("areas_unavailable");
      const data=await r.json();
      if(!Array.isArray(data.areas))throw Error("invalid_areas");
      const select=this._root.getElementById("zone");
      select.replaceChildren();
      const empty=document.createElement("option");empty.value="";empty.textContent="Выбрать зону";select.appendChild(empty);
      for(const area of data.areas){
        if(typeof area.id!=="string"||typeof area.name!=="string")continue;
        const o=document.createElement("option");o.value=area.id;o.textContent=area.name;select.appendChild(o);
      }
      this._loadReview();
    }catch{this._root.getElementById("registration").textContent="Не удалось загрузить зоны Home Assistant.";}
  }
  async _refresh(){
    if(this._busy)return;
    const r=this._root;
    r.getElementById("refresh").disabled=true;
    const old=this._selected;
    try {
      await this._loadAreas();
      const response=await fetch("/local/lighting-commissioning/catalog.json?t="+Date.now(),{cache:"no-store"});
      if(!response.ok)throw Error("snapshot_unavailable");
      const data=await response.json();
      const registry=Array.isArray(data.entities)?data.entities.filter(x=>typeof x.entity_id==="string"&&/^light\.[a-z0-9_]+$/.test(x.entity_id)):[];
      const byId=new Map(registry.map(x=>[x.entity_id,x]));
      for(const [id,v] of Object.entries(this._hass?.states||{})){
        if(/^light\.[a-z0-9_]+$/.test(id)&&!byId.has(id))byId.set(id,{entity_id:id,name:v.attributes?.friendly_name||id,platform:"live_only",area_id:null,disabled:false});
      }
      this._catalog=[...byId.values()].sort((a,b)=>a.entity_id.localeCompare(b.entity_id));
      this._selected=old;
      this._options();
      r.getElementById("count").textContent=this._catalog.length+" световых сущностей · обновлено сейчас (текущие состояния HA, каталог — снимок реестра)";
      r.getElementById("result").textContent="Список обновлён. Доступность устройств определяется текущим состоянием HA.";
    }catch {
      r.getElementById("result").textContent="Не удалось обновить снимок каталога. Состояния HA по-прежнему доступны.";
      this._options();
    }finally{r.getElementById("refresh").disabled=false;}
  }
  _options(){
    const sel=this._root.getElementById("device"),old=this._selected;
    const query=this._root.getElementById("filter").value.trim().toLocaleLowerCase("ru-RU");
    const available=this._catalog.filter(x=>(x.entity_id+" "+x.name+" "+(x.area_id||"")).toLocaleLowerCase("ru-RU").includes(query));
    if(!this._catalog.length && this._hass?.states?.["light.koridor_2"])available.push({entity_id:"light.koridor_2",name:"Подсветка коридора"});
    sel.replaceChildren();
    for(const item of available){
      const option=document.createElement("option");option.value=item.entity_id;option.textContent=item.name+" · "+item.entity_id;sel.appendChild(option);
    }
    if(available.some(x=>x.entity_id===old))sel.value=old;
    this._selected=sel.value||"";
    this._loadReview();this._render();
  }
  _render(){
    const r=this._root;if(!r)return;
    const id=this._selected,entry=this._catalog.find(x=>x.entity_id===id);
    const state=this._hass?.states?.[id];
    r.getElementById("name").textContent=entry?.name||state?.attributes?.friendly_name||"Светильник не выбран";
    r.getElementById("id").textContent=id;
    r.getElementById("meta").textContent=entry?("Интеграция: "+(entry.platform||"не указана")+" · область: "+(entry.area_id||"не задана")):"";
    const value=state?.state??"не найден";
    r.getElementById("state").textContent="Состояние: "+({on:"Включён",off:"Выключен",unavailable:"Недоступен",unknown:"Неизвестен"}[value]||value);
    const authorized=this._eligible(entry,state) && !this._busy;
    r.getElementById("policy").textContent=authorized
      ?"Доступно ручное управление выбранным светильником с подтверждением. Мигание ограничено проверенной подсветкой коридора."
      :"Только просмотр: устройство недоступно, не подтверждено как обычный светильник либо исключено из безопасного управления.";
    r.getElementById("details").disabled=!state;
    r.getElementById("on").disabled=!authorized;
    r.getElementById("off").disabled=!authorized;
    r.getElementById("identify").disabled=!authorized || id!=="light.koridor_2";
    r.getElementById("stop").disabled=!this._busy;
    r.getElementById("device").disabled=this._busy;
    r.getElementById("filter").disabled=this._busy;
  }
  _eligible(entry,state){
    return !!(entry && !entry.disabled && state && ["on","off"].includes(state.state) && /^light\.[a-z0-9_]+$/.test(entry.entity_id));
  }
  async _operate(service){
    const id=this._selected;
    const entry=this._catalog.find(x=>x.entity_id===id);
    if(this._busy||!["turn_on","turn_off"].includes(service)||!this._eligible(entry,this._hass?.states?.[id]))return;
    if(!window.confirm((service==="turn_on"?"Включить":"Выключить")+" выбранный светильник: "+id+"? Группа или виртуальный светильник может затронуть несколько устройств."))return;
    this._busy=true;this._render();
    try{
      await this._hass.callService("light",service,{entity_id:id});
      this._root.getElementById("result").textContent="Команда отправлена. Проверяй фактическое состояние светильника.";
    }catch(e){this._root.getElementById("result").textContent="Ошибка управления: "+String(e?.message||e);}
    finally{this._busy=false;this._render();}
  }
  _loadReview(){
    const id=this._selected,r=this._root;
    let record=null;
    try{record=JSON.parse(localStorage.getItem("ha-commissioning-review-"+id)||"null");}catch{}
    r.getElementById("zone").value=record?.zone||"";
    r.getElementById("description").value=record?.description||"";
    r.getElementById("alias").value=record?.alias||"";
    r.getElementById("registration").textContent=record?"Сохранено в этом браузере · ожидает физической проверки и импорта в Pi":"Ещё не зарегистрировано";
  }
  _saveReview(){
    const id=this._selected,zone=this._root.getElementById("zone").value;
    const description=this._root.getElementById("description").value.trim();
    const alias=this._root.getElementById("alias").value.trim();
    if(!this._catalog.some(x=>x.entity_id===id)||!zone||!description){
      this._root.getElementById("registration").textContent="Выбери устройство, зону и заполни описание.";return;
    }
    try{
      localStorage.setItem("ha-commissioning-review-"+id,JSON.stringify({
        entityId:id,zone,description,alias,reviewMode:"manual_browser_review",
        ai_authorized:false,physical_verified:false,savedAt:new Date().toISOString()
      }));
      this._root.getElementById("registration").textContent="Сохранено в браузере. Пока не передано в Pi и не изменяет Home Assistant.";
    }catch{this._root.getElementById("registration").textContent="Не удалось сохранить в браузере.";}
  }
  async _identify(){
    const id=this._selected,entry=this._catalog.find(x=>x.entity_id===id);
    // First real commissioning trial is explicitly restricted to the tested corridor light.
    if(this._busy||id!=="light.koridor_2"||!this._eligible(entry,this._hass?.states?.[id]))return;
    const initial=this._hass.states[id].state;
    if(!window.confirm("Мигать подсветкой коридора light.koridor_2 до 8 секунд? Это физически переключит свет. Исходное состояние будет восстановлено по возможности."))return;
    this._busy=true;this._blinkStop=false;this._render();
    const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const start=Date.now();
    let previous=initial;
    try{
      for(let i=0;i<4;i++){
        if(this._blinkStop||Date.now()-start>=8000)break;
        const next=previous==="on"?"off":"on";
        await this._hass.callService("light",next==="on"?"turn_on":"turn_off",{entity_id:id});
        previous=next;
        await wait(Math.min(2000,Math.max(0,8000-(Date.now()-start))));
      }
    }catch(e){this._root.getElementById("result").textContent="Сбой теста: "+String(e?.message||e);}
    finally{
      try{
        await this._hass.callService("light",initial==="on"?"turn_on":"turn_off",{entity_id:id});
        this._root.getElementById("result").textContent="Проверка завершена; команда восстановления исходного состояния отправлена. Проверь свет физически.";
      }catch{this._root.getElementById("result").textContent="ВНИМАНИЕ: восстановление состояния не удалось. Проверь свет вручную.";}
      this._busy=false;this._blinkStop=false;this._render();
    }
  }
  getCardSize(){return 9;}
}
if(!customElements.get("lighting-control-card"))customElements.define("lighting-control-card",LightingControlCard);
window.customCards=window.customCards||[];
if(!window.customCards.some(x=>x.type==="lighting-control-card"))window.customCards.push({type:"lighting-control-card",name:"Полное управление освещением",description:"Управление всеми светильниками и редактирование данных мастера"});
