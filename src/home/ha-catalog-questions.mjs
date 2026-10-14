// DEV-only metadata questions. Caller MUST supply a fresh, complete 5-list catalog.
// No HA connection, device state requests, service calls, permissions or Telegram poller.
const fail=(reason)=>Object.freeze({status:'unverified',reason,authorizesRead:false,authorizesWrite:false});
const clean=x=>typeof x==='string'?x.trim().toLocaleLowerCase('ru'):'';
const result=(text,kind)=>Object.freeze({status:'answered',kind,text,authorizesRead:false,authorizesWrite:false});
export function answerHARegistryQuestion(session,question){
 if(typeof question!=='string'||question.length>250)return fail('invalid_question');
 const catalog=session?.getVerifiedCatalog?.();
 if(catalog?.status!=='validated_snapshot'||catalog.complete!==true||
   !Array.isArray(catalog.areas)||!Array.isArray(catalog.entities)||
   !Array.isArray(catalog.devices)||!Array.isArray(catalog.floors))
  return fail('catalog_not_fresh');
 const q=clean(question);
 if(/(?:^|[^\p{L}])(включи|выключи|открой|закрой|удали|измени|перемести)(?=$|[^\p{L}])/u.test(q))return fail('action_request_denied');
 const area=catalog.areas.filter(a=>{
  const name=clean(a.name);
  // Common Russian prepositional forms: кухня→кухне, ванная→ванной.
  const root=name.endsWith('ня')?name.slice(0,-1):name.endsWith('ая')?name.slice(0,-2):name;
  return name.length>=4&&(q.includes(name)||(root.length>=4&&q.includes(root)));
 });
 if(/не распределен|без комнат|без зоны/.test(q)){
  const n=catalog.entities.filter(e=>e.areaId===null).length;
  return result(`Без назначенной комнаты: ${n} записей сущностей Home Assistant. Это не обязательно ошибка.`,'unassigned');
 }
 if(/отключен|отключены|отключено/.test(q)){
  const n=catalog.entities.filter(e=>e.enabled===false).length;
  return result(`В реестре отключено ${n} записей сущностей Home Assistant; это не обязательно неисправные устройства.`,'disabled');
 }
 if(area.length>1)return fail('ambiguous_area');
 if(area.length===1){
  const a=area[0];
  const e=catalog.entities.filter(x=>x.areaId===a.id);
  if(/сколько.*(свет|ламп|светильник)/.test(q)){
   const n=e.filter(x=>x.domain==='light').length;
   return result(`В зоне «${a.name}» зарегистрировано ${n} сущностей light.*. Количество физических светильников неизвестно.`,'area_lights');
  }
  if(/(устройств|устройства|что есть|что находится)/.test(q)){
   const dev=new Set(e.map(x=>x.deviceId).filter(Boolean));
   for(const d of catalog.devices)if(d.areaId===a.id)dev.add(d.id);
   return result(`Зона «${a.name}»: ${dev.size} записей устройств HA и ${e.length} записей сущностей. Это не число физических приборов.`,'area_devices');
  }
 }
 if(/(где|в какой комнате|расположен)/.test(q)){
  const terms=q.match(/[a-z0-9_]+\.[a-z0-9_]+/g)??[];
  if(terms.length!==1)return fail('exact_entity_id_required');
  const found=catalog.entities.filter(e=>e.entityId===terms[0]);
  if(found.length!==1)return fail('entity_not_found');
  const a=catalog.areas.find(x=>x.id===found[0].areaId);
  return result(a?`Сущность ${terms[0]} относится к зоне «${a.name}».`:`У сущности ${terms[0]} нет назначенной зоны.`,'entity_area');
 }
 if(/втор.*этаж|2.*этаж/.test(q)){
  const floors=catalog.floors.filter(f=>/втор|(^|\D)2(\D|$)/i.test(f.name));
  if(floors.length!==1)return fail('floor_not_identified');
  const areas=new Set(catalog.areas.filter(a=>a.floorId===floors[0].id).map(a=>a.id));
  const n=catalog.entities.filter(e=>areas.has(e.areaId)).length;
  return result(`На этаже «${floors[0].name}» учтено ${n} сущностей HA в ${areas.size} зонах. Физическое количество устройств неизвестно.`,'floor_entities');
 }
 return fail('unsupported_question');
}
