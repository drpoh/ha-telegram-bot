import test from 'node:test';
import assert from 'node:assert/strict';
import {probeHARegistrySubscriptions,HA_REGISTRY_EVENTS} from '../src/home/ha-ws-registry-subscription-proof.mjs';
function fake({rejectAt=0,sendEvent=false}={}){
 const sent=[];
 class Socket{
  constructor(){this.listeners={};queueMicrotask(()=>this.emit({type:'auth_required'}));}
  addEventListener(type,cb){(this.listeners[type]??=[]).push(cb);}
  emit(data){for(const cb of this.listeners.message??[])cb({data:JSON.stringify(data)});}
  send(raw){
   const msg=JSON.parse(raw);sent.push(msg);
   if(msg.type==='auth')queueMicrotask(()=>this.emit({type:'auth_ok'}));
   if(msg.type==='subscribe_events')queueMicrotask(()=>{
    this.emit({id:msg.id,type:'result',success:msg.id!==rejectAt,result:null});
    if(sendEvent&&msg.id===1)this.emit({id:1,type:'event',event:{event_type:'floor_registry_updated',data:{secret:'ignored'}}});
   });
  }
  close(){}
 }
 return {Socket,sent};
}
test('exact five native subscriptions, no writes and no raw secrets',async()=>{
 const {Socket,sent}=fake({sendEvent:true});
 const r=await probeHARegistrySubscriptions({url:'ws://192.168.31.94:8123/api/websocket',
  token:'never-real-token-test',WebSocketImpl:Socket,observeMs:0,timeoutMs:1000});
 assert.equal(r.status,'subscribed');
 assert.equal(r.subscriptions,5);
 assert.deepEqual(sent.slice(1).map(x=>x.event_type),HA_REGISTRY_EVENTS);
 assert.equal(sent[0].type,'auth');
 assert.ok(sent.slice(1).every(x=>x.type==='subscribe_events'));
 assert.equal(r.writes,0);
 assert.doesNotMatch(JSON.stringify(r),/never-real-token-test|ignored/);
});
test('rejected event kind fails closed without disclosing HA error',async()=>{
 const {Socket,sent}=fake({rejectAt:3});
 const r=await probeHARegistrySubscriptions({url:'ws://localhost:8123/api/websocket',
  token:'never-real-token-test',WebSocketImpl:Socket,observeMs:0,timeoutMs:1000});
 assert.equal(r.status,'unverified');
 assert.equal(r.reason,'subscription_rejected');
 assert.equal(r.rejectedType,'device_registry_updated');
 assert.equal(r.subscriptions,2);
 assert.equal(sent.length,4);
});
test('invalid endpoint/token blocked before socket creation',async()=>{
 const x=await probeHARegistrySubscriptions({url:'ws://public.example/api/websocket',
 token:'never-real-token-test',WebSocketImpl:class {}});
 assert.equal(x.reason,'endpoint_denied');
 const y=await probeHARegistrySubscriptions({url:'ws://localhost:8123/api/websocket',
 token:'',WebSocketImpl:class {}});
 assert.equal(y.reason,'credential_not_configured');
});
test('manual script defaults to no network and does not log raw events',async()=>{
 const fs=await import('node:fs');
 const s=fs.readFileSync(new URL('../scripts/manual/v3-ha-ws-registry-subscription-proof.mjs',import.meta.url),'utf8');
 assert.match(s,/--preflight/);
 assert.match(s,/--read-only/);
 assert.doesNotMatch(s,/call_service|ha_set_area|writeFile|process\.env\.HA_CATALOG_TOKEN\s*=/);
});
