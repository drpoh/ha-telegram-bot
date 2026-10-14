// One-shot WebSocket reader for official Home Assistant registry lists.
// No service calls, subscriptions, token creation, persistence or production integration.
// Caller injects WebSocket constructor (e.g. native Node >=20 when available).
import {HA_REGISTRY_READ_COMMANDS} from './ha-ws-registry-snapshot.mjs';
import {readHARegistrySnapshot,summarizeHARegistryRead} from './ha-ws-registry-loader.mjs';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const fail=reason=>({status:'unverified',reason,authorizesRead:false,authorizesWrite:false});
export function checkHACatalogEndpoint(value){
 if(typeof value!=='string'||value.length>250)return fail('url_not_configured');
 let parsed;
 try{parsed=new URL(value);}catch{return fail('invalid_url');}
 if(parsed.username||parsed.password||parsed.hash||parsed.search||
    parsed.pathname!=='/api/websocket'||!['ws:','wss:'].includes(parsed.protocol))
  return fail('invalid_url');
 // Reject plain-text connection except loopback, RFC1918 and mDNS LAN.
 const host=parsed.hostname.toLowerCase().replace(/^\[|\]$/g,'');
 const privateHost=host==='localhost'||host.endsWith('.local')||
  /^127\./.test(host)||/^10\./.test(host)||/^192\.168\./.test(host)||
  /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host);
 if(parsed.protocol==='ws:'&&!privateHost)return fail('insecure_remote_url');
 return {status:'approved_url',url:parsed.href,authorizesRead:false,authorizesWrite:false};
}
export async function readCatalogViaHACoreWebSocket({
 url,token,WebSocketImpl,timeoutMs=10000
}={}){
 const endpoint=checkHACatalogEndpoint(url);
 if(endpoint.status!=='approved_url')return fail(endpoint.reason);
 if(typeof token!=='string'||token.length<16||token.length>4096)
  return fail('credential_not_configured');
 if(typeof WebSocketImpl!=='function')return fail('websocket_unavailable');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<500||timeoutMs>30000)
  return fail('invalid_timeout');
 let socket,alarm,pending=null,requestId=0,authenticated=false;
 const readResults=new Map();
 const safeClose=()=>{try{socket?.close();}catch{}};
 const pendingReject=()=>{
  if(pending){pending.reject(Error('connection_closed'));pending=null;}
 };
 let stop;
 try{
  socket=new WebSocketImpl(endpoint.url);
  const done=new Promise((resolve,reject)=>{
   stop=reject;
   alarm=setTimeout(()=>reject(Error('connection_timeout')),timeoutMs*7);
   const send=payload=>socket.send(JSON.stringify(payload));
   const runNext=()=>{
    if(readResults.size===HA_REGISTRY_READ_COMMANDS.length){
     resolve(Object.fromEntries(readResults));return;
    }
    const index=readResults.size;
    const type=HA_REGISTRY_READ_COMMANDS[index];
    const id=++requestId;
    // Only one exact approved read outstanding at any moment.
    pending={id,type,reject};
    send({id,type});
   };
   socket.addEventListener('message',ev=>{
    let msg;
    try{msg=JSON.parse(typeof ev.data==='string'?ev.data:String(ev.data));}
    catch{reject(Error('invalid_json'));return;}
    if(!authenticated){
     if(msg.type==='auth_required'){send({type:'auth',access_token:token});return;}
     if(msg.type==='auth_ok'){authenticated=true;runNext();return;}
     reject(Error('auth_failed'));return;
    }
    if(msg.type!=='result'||!pending||msg.id!==pending.id){
     reject(Error('unexpected_response'));return;
    }
    const name=['floors','areas','devices','entities','labels'][readResults.size];
    if(msg.success!==true||!Array.isArray(msg.result)){
     reject(Error('registry_read_failed'));return;
    }
    readResults.set(name,{success:true,result:msg.result});
    pending=null;
    runNext();
   });
   socket.addEventListener('error',()=>reject(Error('connection_error')));
   socket.addEventListener('close',()=>reject(Error('connection_closed')));
  });
  const responses=await done;
  // Reuse existing injected loader contract without issuing any more WS reads.
  const snapshot=await readHARegistrySnapshot({
   sendMessagePromise:async({type})=>{
    const index=HA_REGISTRY_READ_COMMANDS.indexOf(type);
    if(index<0)throw Error('unknown_command');
    return responses[['floors','areas','devices','entities','labels'][index]].result;
   }
  },{timeoutMs});
  return summarizeHARegistryRead(snapshot);
 }catch{return fail('connection_or_registry_error');}
 finally{clearTimeout(alarm);pendingReject();safeClose();}
}
