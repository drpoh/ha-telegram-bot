class LightingReviewCard extends HTMLElement {
  setConfig(config) {
    if (config?.type !== "custom:lighting-review-card") throw Error("Invalid card");
    this._config=config;
    if (!this._initialized) this._init();
  }
  _init() {
    this._initialized=true;
    this._selected="light.koridor_2";
    this._catalog=[];
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
        <h2>Поиск и проверка светильников</h2>
        <div class="subtitle">Текущее состояние из Home Assistant · каталог реестра для выбора устройства</div>
        <label for="filter">Поиск</label><input id="filter" placeholder="Название или идентификатор"/>
        <label for="device">Светильник</label><select id="device"></select>
        <div class="info"><div id="name" class="name"></div><div id="id" class="meta"></div><div id="meta" class="meta"></div><div id="state" class="state"></div></div>
        <div class="buttons"><button class="primary" id="on">Включить</button><button id="off">Выключить</button></div>
        <div class="notice" id="policy">Ручное управление только подсветкой коридора (light.koridor_2), с подтверждением. Автоматическое мигание отключено.</div>
        <div id="result" class="subtitle" role="status" aria-live="polite"></div>
      </div></ha-card>`;
    this._root=root;
    root.getElementById("filter").addEventListener("input",()=>this._options());
    root.getElementById("device").addEventListener("change",e=>{this._selected=e.target.value;this._render();});
    root.getElementById("on").addEventListener("click",()=>this._operate("turn_on"));
    root.getElementById("off").addEventListener("click",()=>this._operate("turn_off"));
    fetch("/local/lighting-commissioning/catalog.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("catalog");return r.json();}).then(v=>{
      this._catalog=Array.isArray(v.entities)?v.entities.filter(x=>typeof x.entity_id==="string"&&x.entity_id.startsWith("light.")):[];
      this._options();this._render();
    }).catch(()=>{this._catalog=[];this._options();this._render();root.getElementById("result").textContent="Каталог временно недоступен.";});
  }
  set hass(hass){this._hass=hass;if(this._initialized)this._render();}
  _options(){
    const sel=this._root.getElementById("device"),old=this._selected;
    const query=this._root.getElementById("filter").value.trim().toLocaleLowerCase("ru-RU");
    const available=this._catalog.filter(x=>(x.entity_id+" "+x.name).toLocaleLowerCase("ru-RU").includes(query));
    if(!this._catalog.length)available.push({entity_id:"light.koridor_2",name:"Подсветка коридора"});
    sel.replaceChildren();
    for(const item of available){
      const option=document.createElement("option");option.value=item.entity_id;option.textContent=item.name+" · "+item.entity_id;sel.appendChild(option);
    }
    if(available.some(x=>x.entity_id===old))sel.value=old;
    this._selected=sel.value||"";
    this._render();
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
    const authorized=id==="light.koridor_2" && (value==="on"||value==="off") && !entry?.disabled && !this._busy;
    r.getElementById("on").disabled=!authorized;
    r.getElementById("off").disabled=!authorized;
  }
  async _operate(service){
    const id=this._selected;
    if(this._busy||id!=="light.koridor_2"||!["on","off"].includes(this._hass?.states?.[id]?.state))return;
    if(!window.confirm((service==="turn_on"?"Включить":"Выключить")+" подсветку коридора?"))return;
    this._busy=true;this._render();
    try{
      await this._hass.callService("light",service,{entity_id:"light.koridor_2"});
      this._root.getElementById("result").textContent="Команда отправлена. Проверяй фактическое состояние светильника.";
    }catch(e){this._root.getElementById("result").textContent="Ошибка управления: "+String(e?.message||e);}
    finally{this._busy=false;this._render();}
  }
  getCardSize(){return 5;}
}
if(!customElements.get("lighting-review-card"))customElements.define("lighting-review-card",LightingReviewCard);
window.customCards=window.customCards||[];
if(!window.customCards.some(x=>x.type==="lighting-review-card"))window.customCards.push({type:"lighting-review-card",name:"Мастер освещения",description:"Просмотр состояний и ограниченное ручное управление"});
