// Pilot read-only inventory: explicit HA entity IDs, never registry search.
// Names are static labels, not identifiers inferred from untrusted dialogue.
export const LIGHT_OVERVIEW_TARGETS=Object.freeze([
 Object.freeze({id:'light.tambur_svet_l1',label:'Тамбур'}),
 Object.freeze({id:'light.koridor',label:'Коридор'}),
 Object.freeze({id:'light.koridor_2',label:'Коридор 2'}),
 Object.freeze({id:'light.koridor_1_etazh',label:'Коридор, первый этаж'}),
 Object.freeze({id:'light.koridor_1_etazh_2',label:'Коридор, первый этаж 2'}),
 Object.freeze({id:'light.koridor_spot',label:'Коридор, споты'}),
 Object.freeze({id:'light.koridor_spot_2',label:'Коридор, споты 2'})
]);
export const LIGHT_OVERVIEW_IDS=Object.freeze(LIGHT_OVERVIEW_TARGETS.map(x=>x.id));
const readValue=(result,id)=>{
 if(result?.isError===true)return null;
 const envelope=result?.structuredContent??result;
 const state=envelope?.data??envelope;
 if(state?.entity_id!==id||!['on','off'].includes(state.state))return null;
 return state.state;
};
export async function summarizeLightOverview({readState}={}){
 const error={status:'unavailable',authorization:false,actualWrite:false,text:'Не удалось проверить освещение. Состояние неизвестно.'};
 if(typeof readState!=='function')return error;
 // Bounded serial reads; one scoped entity per MCP request; partial failures stay visible.
 const on=[],unknown=[];let off=0;
 for(const target of LIGHT_OVERVIEW_TARGETS){
  let state=null;
  try{state=readValue(await readState(target.id),target.id);}catch{}
  if(state==='on')on.push(target.label);
  else if(state==='off')off++;
  else unknown.push(target.label);
 }
 const summary=`Освещение (выбранные 7 устройств): включено ${on.length}, выключено ${off}, состояние неизвестно ${unknown.length}.`;
 const detail=on.length?` Включены: ${on.join(', ')}.`:'';
 const caveat=unknown.length?` Нет данных: ${unknown.join(', ')}.`:'';
 return {status:unknown.length?'partial':'complete',authorization:false,actualWrite:false,onCount:on.length,offCount:off,unknownCount:unknown.length,text:summary+detail+caveat};
}
