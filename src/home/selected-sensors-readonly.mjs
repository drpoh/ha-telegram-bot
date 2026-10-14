// Explicitly reviewed sensor state reads only; no discovery and no service calls.
// Sauna continues to use its existing validated two-entity summary.
export const SENSOR_READONLY_TARGETS=Object.freeze({
 dishwasher_power:Object.freeze({id:'sensor.posudomoika_power',label:'Посудомоечная машина — мощность',unit:'Вт',min:0,max:15000}),
 bathroom_switch_battery:Object.freeze({id:'sensor.vykliuchatel_vannaia_battery',label:'Выключатель ванной — батарея',unit:'%',min:0,max:100})
});
const unavailable=()=>({status:'unavailable',authorization:false,actualWrite:false,
 text:'Показание датчика недоступно или недостоверно. Никаких команд не отправлено.'});
export async function summarizeSelectedSensor({sensor,readState}={}){
 const target=Object.hasOwn(SENSOR_READONLY_TARGETS,sensor)?SENSOR_READONLY_TARGETS[sensor]:null;
 if(!target||typeof readState!=='function')return unavailable();
 try{
  const raw=await readState(target.id);
  const v=raw?.structuredContent??raw;
  const data=v?.data??v;
  if(raw?.isError===true||data?.entity_id!==target.id||
     data?.state===null||typeof data?.state!=='string'&&typeof data?.state!=='number')
   return unavailable();
  const state=String(data.state).trim();
  if(!/^(?:\d+)(?:\.\d+)?$/.test(state))return unavailable();
  const number=Number(state);
  if(!Number.isFinite(number)||number<target.min||number>target.max)return unavailable();
  // Do not infer device activity, dishwashing status, or stale-data freshness.
  return {status:'complete',authorization:false,actualWrite:false,
   text:target.label+': '+number+' '+target.unit+'. Значение выбранной сущности HA, без проверки свежести показания.'};
 }catch{return unavailable();}
}
