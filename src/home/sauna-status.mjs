// Exact sauna read-only summary. No MCP client or HA write capability.
// The temperature reading is time-sensitive; the readiness entity can stay
// unchanged for many hours, so its last_changed is not a freshness test.
export async function summarizeSauna({readState,mode='status'}={}){
 const unavailable={status:'unavailable',authorization:false,actualWrite:false,text:'Не удалось получить достоверное состояние сауны.'};
 if(typeof readState!=='function')return unavailable;
 const read=async id=>{
  const result=await readState(id);
  if(result?.isError===true)return null;
  const value=result?.structuredContent??result;
  const state=value?.data??value;
  return state?.entity_id===id&&typeof state.state==='string'?state.state:null;
 };
 try{
  const temp=await read('sensor.sauna_te_sauna_temperature');
  const ready=await read('binary_sensor.sauna_sauna_te_sauna_ready');
  if(temp===null||ready===null)return unavailable;
  const temperature=Number(temp);
  if(!Number.isFinite(temperature)||temperature< -40||temperature>150||
     !['on','off'].includes(ready))return unavailable;
  const readyText=ready==='on'?'Сауна готова.':'Сауна ещё не готова.';
  const text=mode==='temperature'
   ? `Температура сауны: ${temperature} °C.`
   :mode==='ready'
    ? `${readyText} Порог готовности: 85 °C.`
    :`Температура сауны: ${temperature} °C. ${readyText} Порог готовности: 85 °C.`;
  return {status:'complete',authorization:false,actualWrite:false,temperature,ready:ready==='on',text};
 }catch{return unavailable;}
}
