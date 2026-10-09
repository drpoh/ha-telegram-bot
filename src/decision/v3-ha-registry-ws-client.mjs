import {createRegistryFrameSession} from './v3-ha-registry-ws-frames.mjs';

// Offline transport harness: a caller supplies a trusted, already-connected
// socket fixture. No DNS, TLS, token lookup, WebSocket construction or live HA.
const allowed=new Set(['config/entity_registry/list','config/device_registry/list','config/area_registry/list']);
export async function testRegistrySocket({socket,commands=[...allowed],token,timeoutMs=2000}={}){
 const deny=reason=>({ok:false,authorization:false,reason});
 if(!socket||typeof socket.exchange!=='function'||typeof socket.close!=='function'||
  typeof token!=='string'||!token||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000||
  !Array.isArray(commands)||commands.some(c=>!allowed.has(c)))return deny('invalid_transport_configuration');
 const state=createRegistryFrameSession();
 const exchange=async frame=>{
  // Cancellation is cooperative: the injected socket must honor signal.
  // Timeout alone must never be mistaken for confirmed cancellation.
  const controller=new AbortController();
  let timer;
  try{return await Promise.race([
   Promise.resolve().then(()=>socket.exchange(frame,{signal:controller.signal})),
   new Promise((_,reject)=>{timer=setTimeout(()=>{
    controller.abort();reject(Error('timeout'));
   },timeoutMs);})
  ]);}
  finally{clearTimeout(timer);controller.abort();}
 };
 try{
  const hello=state.receive(await exchange(null));if(!hello.ok)return deny(hello.reason);
  const auth=state.receive(await exchange(JSON.stringify({type:'auth',access_token:token})));
  if(!auth.ok)return deny(auth.reason);
  const result={};
  for(const command of commands){
   const req=state.command(command);if(!req.ok)return deny(req.reason);
   const response=state.receive(await exchange(req.frame));if(!response.ok)return deny(response.reason);
   result[command]=response.records;
  }
  return {ok:true,authorization:false,status:'mock_transport_only',records:result};
 }catch{return deny('transport_disconnected_or_timeout');}
 finally{state.abort();try{await socket.close();}catch{/* deny reuse */}}
}
