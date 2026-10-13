// Pilot read-only inventory: explicit HA entity IDs, never registry search.
// Names are static labels, not identifiers inferred from untrusted dialogue.
export const LIGHT_OVERVIEW_TARGETS=Object.freeze([
 Object.freeze({id:'light.tambur_svet_l1',label:'Тамбур'}),
 Object.freeze({id:'light.koridor',label:'Коридор'}),
 Object.freeze({id:'light.koridor_1_etazh',label:'Коридор, первый этаж'}),
 Object.freeze({id:'light.koridor_spot',label:'Коридор, споты'})
]);
export const LIGHT_OVERVIEW_IDS=Object.freeze(LIGHT_OVERVIEW_TARGETS.map(x=>x.id));
const readValue=(result,id)=>{
 if(result?.isError===true)return null;
 const envelope=result?.structuredContent??result;
 const state=envelope?.data??envelope;
 if(state?.entity_id!==id||!['on','off'].includes(state.state))return null;
 return state.state;
};
export async function summarizeLightOverview({readState,mode='overview'}={}){
 const error={status:'unavailable',authorization:false,actualWrite:false,text:'Не удалось проверить освещение. Состояние неизвестно.'};
 if(typeof readState!=='function')return error;
 // Bounded serial reads; one scoped entity per MCP request; partial failures stay visible.
 const on=[],off=[],unknown=[];
 for(const target of LIGHT_OVERVIEW_TARGETS){
  let state=null;
  try{state=readValue(await readState(target.id),target.id);}catch{}
  if(state==='on')on.push(target.label);
  else if(state==='off')off.push(target.label);
  else unknown.push(target.id);
 }
 const summary=`Освещение (состояния ${LIGHT_OVERVIEW_TARGETS.length} выбранных сущностей HA, не число физических ламп): on ${on.length}, off ${off.length}, недоступны или неизвестны ${unknown.length}.`;
 const detail=on.length?` В состоянии on: ${on.join(', ')}.`:'';
 const offDetail=off.length?` В состоянии off: ${off.join(', ')}.`:'';
 const allOff=unknown.length?' Не все состояния известны: нельзя достоверно сказать, что весь выбранный свет выключен.':on.length?' Не весь выбранный свет выключен.':' Весь выбранный свет выключен.';
 const caveat=unknown.length?` Требуют проверки: ${unknown.join(', ')}.`:'';
 // Question-specific responses use the same bounded reads and never infer wider HA coverage.
 let text=summary+detail+offDetail+allOff+caveat;
 if(mode==='off'){
  text=off.length?'Выключены: '+off.join(', ')+'.':'Среди выбранных сущностей HA выключенный свет не подтверждён.';
  if(unknown.length)text+=' Неизвестны: '+unknown.join(', ')+'.';
 }else if(mode==='all_off'){
  if(on.length)text='Нет, не весь выбранный свет выключен. Включены: '+on.join(', ')+'.';
  else if(unknown.length)text='Не могу подтвердить, что весь выбранный свет выключен: есть неизвестные состояния.';
  else text='Да, весь выбранный свет выключен.';
  if(unknown.length)text+=' Неизвестны: '+unknown.join(', ')+'.';
 }
 if(mode==='off'||mode==='all_off')text+=' Это только 4 выбранные сущности HA, не весь дом.';
 return {status:unknown.length?'partial':'complete',authorization:false,actualWrite:false,onCount:on.length,offCount:off.length,unknownCount:unknown.length,text};
}
