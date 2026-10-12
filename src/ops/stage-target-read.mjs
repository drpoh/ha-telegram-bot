import {resolveStageLight} from '../decision/v3-stage-target-resolution.mjs';
// Strict, mock-only consumer. This is not an HA adapter or an action grant.
export async function resolveMockStageTarget({baseUrl,name,areaId,now,fetchImpl=fetch}={}){
 const deny=reason=>({status:'denied',reason,authorized:false});
 if(typeof baseUrl!=='string'||typeof fetchImpl!=='function')return deny('invalid_mock_endpoint');
 let url;
 try{url=new URL(baseUrl);}catch{return deny('invalid_mock_endpoint');}
 if(url.origin!==`http://127.0.0.1:${url.port}`||!url.port||url.pathname!=='/'||url.search||url.hash||url.username||url.password)
  return deny('invalid_mock_endpoint');
 try{
  const response=await fetchImpl(new URL('/registry',url),{method:'GET',redirect:'error',signal:AbortSignal.timeout(1500)});
  if(response.status!==200||!response.headers.get('content-type')?.startsWith('application/json'))return deny('mock_registry_http_error');
  const snapshot=await response.json();
  if(snapshot.authorization!==false||snapshot.environment!=='stage'||snapshot.mode!=='mock')return deny('untrusted_mock_snapshot');
  return resolveStageLight({snapshot,name,areaId,now:now??Date.now()});
 }catch{return deny('mock_registry_unavailable');}
}
