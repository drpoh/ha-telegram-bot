// Operator-only bounded subscription proof against native HA WebSocket.
// Five subscribe_events requests, no registry modification, states or service calls.
// Never log raw event contents, entity identifiers or credentials.
import {checkHACatalogEndpoint} from './ha-ws-once-reader.mjs';
export const HA_REGISTRY_EVENTS=Object.freeze([
 'floor_registry_updated','area_registry_updated','device_registry_updated',
 'entity_registry_updated','label_registry_updated'
]);
const invalid=reason=>({status:'unverified',reason,subscriptions:0,
 eventCounts:[],writes:0});
export async function probeHARegistrySubscriptions({
 url,token,WebSocketImpl,timeoutMs=12000,observeMs=1500
}={}){
 const endpoint=checkHACatalogEndpoint(url);
 if(endpoint.status!=='approved_url')return invalid('endpoint_denied');
 if(typeof token!=='string'||token.length<16||token.length>4096)
  return invalid('credential_not_configured');
 if(typeof WebSocketImpl!=='function'||!Number.isSafeInteger(timeoutMs)||
    timeoutMs<1000||timeoutMs>30000||!Number.isSafeInteger(observeMs)||
    observeMs<0||observeMs>5000)return invalid('invalid_options');
 let socket,timeout,finish,observation;
 const acknowledged=new Set(),events=new Map(HA_REGISTRY_EVENTS.map(x=>[x,0]));
 let phase='authentication',sequence=0,settled=false;
 const close=()=>{try{socket?.close();}catch{}};
 const result=()=>({status:acknowledged.size===HA_REGISTRY_EVENTS.length?'subscribed':'unverified',
  reason:acknowledged.size===HA_REGISTRY_EVENTS.length?'accepted':'incomplete',
  subscriptions:acknowledged.size,
  eventCounts:HA_REGISTRY_EVENTS.map(type=>({type,count:events.get(type)})),
  writes:0});
 try{
  socket=new WebSocketImpl(endpoint.url);
  return await new Promise(resolve=>{
   const end=value=>{if(settled)return;settled=true;clearTimeout(timeout);
    clearTimeout(observation);close();resolve(value);};
   const send=msg=>socket.send(JSON.stringify(msg));
   timeout=setTimeout(()=>end(invalid('timeout')),timeoutMs);
   socket.addEventListener('error',()=>end(invalid('connection_error')));
   socket.addEventListener('close',()=>end(invalid('connection_closed')));
   socket.addEventListener('message',ev=>{
    if(settled)return;
    let msg;
    try{msg=JSON.parse(typeof ev.data==='string'?ev.data:String(ev.data));}
    catch{return end(invalid('invalid_json'));}
    if(phase==='authentication'){
     if(msg.type==='auth_required'){
      phase='await_auth';send({type:'auth',access_token:token});return;
     }
     return end(invalid('unexpected_auth_response'));
    }
    if(phase==='await_auth'){
     if(msg.type!=='auth_ok')return end(invalid('auth_rejected'));
     phase='subscribing';
     send({id:++sequence,type:'subscribe_events',event_type:HA_REGISTRY_EVENTS[0]});
     return;
    }
    if(msg.type==='event'){
     // Acknowledged IDs 1..5 map to fixed approved event types.
     if(Number.isInteger(msg.id)&&msg.id>=1&&msg.id<=5&&acknowledged.has(msg.id)){
      const kind=HA_REGISTRY_EVENTS[msg.id-1];
      events.set(kind,Math.min(1000,events.get(kind)+1));
     }
     return;
    }
    if(msg.type!=='result'||msg.id!==acknowledged.size+1||
       !Number.isInteger(msg.id)||msg.id<1||msg.id>5)
      return end(invalid('unexpected_result'));
    if(msg.success!==true)return end({
     ...invalid('subscription_rejected'),subscriptions:acknowledged.size,
     rejectedType:HA_REGISTRY_EVENTS[msg.id-1]
    });
    acknowledged.add(msg.id);
    if(acknowledged.size===HA_REGISTRY_EVENTS.length){
     phase='observing';
     observation=setTimeout(()=>end(result()),observeMs);
    }else{
     send({id:++sequence,type:'subscribe_events',
      event_type:HA_REGISTRY_EVENTS[acknowledged.size]});
    }
   });
  });
 }catch{return invalid('connection_error');}
 finally{clearTimeout(timeout);clearTimeout(observation);close();}
}
