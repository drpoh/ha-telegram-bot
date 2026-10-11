import {createStageBatchConsent} from './stage-batch-consent.mjs';

// Stage-only transport. Never imports MCP, HA control or production credentials.
export function createStageBatchHttpSimulation({baseUrl,clock=Date.now,fetchImpl=fetch}={}){
 const stage=createStageBatchConsent({clock});
 const deny=reason=>({status:'denied',reason,authorized:false,actualWrite:false});
 let endpoint;
 try{
  const u=new URL(baseUrl);
  if(u.hostname!=='127.0.0.1'||u.protocol!=='http:'||!u.port||u.pathname!=='/'||u.search||u.hash||u.username||u.password)throw Error('invalid');
  endpoint=new URL('/registry',u);
 }catch{return Object.freeze({issue:async()=>deny('invalid_stage_endpoint'),confirm:async()=>deny('invalid_stage_endpoint')});}
 const read=async()=>{
  try{
   const res=await fetchImpl(endpoint,{method:'GET',redirect:'error',signal:AbortSignal.timeout(1500)});
   if(res.status!==200||!res.headers.get('content-type')?.startsWith('application/json'))return null;
   const data=await res.json();
   if(data.environment!=='stage'||data.mode!=='mock'||data.authorization!==false)return null;
   return data;
  }catch{return null;}
 };
 return Object.freeze({
  async issue({actor,requests}={}){const snapshot=await read();return snapshot?stage.issue({actor,requests,snapshot}):deny('stage_snapshot_unavailable');},
  async confirm({actor,token}={}){const snapshot=await read();if(!snapshot){stage.cancel({actor,token});return deny('stage_snapshot_unavailable');}
   return stage.confirm({actor,token,snapshot});},
 });
}
