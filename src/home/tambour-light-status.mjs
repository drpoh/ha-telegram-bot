// Exact existing authorized tambour-light scope, read only.
// Reject mismatched MCP envelopes and ambiguous/unavailable states.
export async function summarizeTambourLight({readState}={}){
 const unavailable={status:'unavailable',authorization:false,actualWrite:false,text:'Не удалось достоверно определить состояние света в тамбуре.'};
 if(typeof readState!=='function')return unavailable;
 const id='light.tambur_svet_l1';
 try{
  const result=await readState(id);
  if(result?.isError===true)return unavailable;
  const envelope=result?.structuredContent??result;
  const state=envelope?.data??envelope;
  if(state?.entity_id!==id||!['on','off'].includes(state.state))return unavailable;
  return {status:'complete',authorization:false,actualWrite:false,on:state.state==='on',text:state.state==='on'?'Свет в тамбуре включён.':'Свет в тамбуре выключен.'};
 }catch{return unavailable;}
}
