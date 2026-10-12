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
export async function summarizeLightOverview({readState,mode='full'}={}){
 const unavailableMsg='Не удалось проверить освещение. Состояние неизвестно.';
 const error={status:'unavailable',authorization:false,actualWrite:false,text:unavailableMsg,fullText:unavailableMsg,offText:unavailableMsg,allOffText:unavailableMsg};
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
 const fullText=summary+detail+offDetail+allOff+caveat;

 const offText=off.length
  ? `Выключенный выбранный свет: ${off.join(', ')}.${caveat}`
  : `Среди ${LIGHT_OVERVIEW_TARGETS.length} выбранных сущностей HA выключенного света нет.${caveat}`;

 const allOffText=unknown.length&&!on.length
  ? `Нельзя достоверно сказать: не все состояния 4 выбранных сущностей HA известны.${caveat}`
  : on.length
   ? `Нет, не весь выбранный свет выключен.${detail}${caveat}`
   : `Да, весь выбранный свет выключен (4 из 4 сущностей HA).`;

 const text=mode==='off_only'?offText:mode==='all_off_check'?allOffText:fullText;

 return {
  status:unknown.length?'partial':'complete',
  authorization:false,
  actualWrite:false,
  onCount:on.length,
  offCount:off.length,
  unknownCount:unknown.length,
  text,
  fullText,
  offText,
  allOffText
 };
}
