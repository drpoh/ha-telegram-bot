// HA-MCP search inventory: pure read-only summary; unknown states are never "off".
export async function summarizeDiscoveredLights({readTool,maxEntities=200,timeoutMs=5000,includeHidden=false}={}){
 const deny=()=>({status:'unavailable',authorization:false,actualWrite:false,text:'Не удалось получить полный список светильников. Состояние дома неизвестно.'});
 if(typeof readTool!=='function'||!Number.isSafeInteger(maxEntities)||maxEntities<1||maxEntities>500||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000||typeof includeHidden!=='boolean')return deny();
 let r;
 let deadline;
 const controller=new AbortController();
 try{
  r=await Promise.race([
   Promise.resolve().then(()=>readTool('ha_search',{query:'',domain_filter:'light',limit:maxEntities,include_hidden:includeHidden,result_fields:['entity_id','domain','state']},{signal:controller.signal})),
   new Promise(resolve=>{deadline=setTimeout(()=>{controller.abort();resolve(null);},timeoutMs);})
  ]);
 }catch{return deny();}finally{clearTimeout(deadline);}
 if(r?.isError===true)return deny();
 const d=r?.structuredContent??r;
 if(d?.success!==true||d.partial!==false||d.entity_has_more!==false||d.entity_next_offset!=null||
  !Number.isSafeInteger(d.entity_total_matches)||d.entity_total_matches<1||
  !Array.isArray(d.entities)||d.entities.length!==d.entity_total_matches||d.entities.length>maxEntities)return deny();
 const seen=new Set(),on=[],off=[],unknown=[],unknownDetails=[];
 for(const e of d.entities){
  if(typeof e?.entity_id!=='string'||!/^light\.[a-z0-9_]+$/.test(e.entity_id)||
    e.domain!=='light'||seen.has(e.entity_id)||typeof e.state!=='string')return deny();
  seen.add(e.entity_id);
  if(e.state==='on')on.push(e.entity_id);
  else if(e.state==='off')off.push(e.entity_id);
  else{
   unknown.push(e.entity_id);
   // Fixed classification; no arbitrary state text or device metadata leaks.
   unknownDetails.push(Object.freeze({id:e.entity_id,reason:e.state==='unavailable'?'unavailable':e.state==='unknown'?'unknown':'other_state'}));
  }
 }
 const summary=`Из ${d.entities.length} найденных светильников: включено ${on.length}, выключено ${off.length}, состояние неизвестно у ${unknown.length}.`;
 const visibleOn=on.slice(0,20);
 const remaining=on.length-visibleOn.length;
 const details=on.length?` Включены: ${visibleOn.join(', ')}${remaining?`; ещё ${remaining} (список сокращён)`:''}.`:' Подтверждённых включённых светильников нет.';
 return {status:unknown.length?'partial':'complete',authorization:false,actualWrite:false,checked:d.entities.length,on,off,unknown,unknownDetails,text:summary+details+(unknown.length?' Неизвестные не считаются выключенными.':'')};
}
