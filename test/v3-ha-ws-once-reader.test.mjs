import test from 'node:test';
import assert from 'node:assert/strict';
import {checkHACatalogEndpoint,readCatalogViaHACoreWebSocket} from '../src/home/ha-ws-once-reader.mjs';
import {HA_REGISTRY_READ_COMMANDS} from '../src/home/ha-ws-registry-snapshot.mjs';
const fixtures=[
 [{floor_id:'ground',name:'First floor'}],
 [{area_id:'kitchen',name:'Kitchen',floor_id:'ground',labels:['control']}],
 [{id:'abcd1234',area_id:'kitchen',labels:['light']}],
 [{entity_id:'light.kitchen',device_id:'abcd1234',area_id:null,labels:['light'],disabled_by:null}],
 [{label_id:'light',name:'Освещение'},{label_id:'control',name:'Управление'}]
];
function fakeWs({errorAt=-1,wrongId=false}={}){
 const sends=[];
 class FakeWebSocket{
  constructor(url){
   this.url=url;this.handlers={};this.index=0;this.closed=false;
   queueMicrotask(()=>this.emit('message',{data:JSON.stringify({type:'auth_required'})}));
  }
  addEventListener(name,callback){(this.handlers[name]??=[]).push(callback);}
  emit(name,event){for(const cb of this.handlers[name]??[])cb(event);}
  send(raw){
   const m=JSON.parse(raw);sends.push(m);
   if(m.type==='auth'){
    queueMicrotask(()=>this.emit('message',{data:JSON.stringify({type:'auth_ok'})}));
    return;
   }
   const index=HA_REGISTRY_READ_COMMANDS.indexOf(m.type);
   const response={type:'result',id:wrongId?m.id+2:m.id,
    success:index!==errorAt,result:fixtures[index]??[]};
   queueMicrotask(()=>this.emit('message',{data:JSON.stringify(response)}));
  }
  close(){this.closed=true;}
 }
 return {FakeWebSocket,sends};
}
test('requires strictly scoped endpoint and explicit token; no public insecure host',async()=>{
 assert.equal(checkHACatalogEndpoint('ws://homeassistant.local:8123/api/websocket').status,'approved_url');
 assert.equal(checkHACatalogEndpoint('ws://192.168.1.55:8123/api/websocket').status,'approved_url');
 for(const url of ['ws://example.com/api/websocket','http://192.168.1.3:8123/api/websocket',
  'ws://192.168.1.3:8123/api/services','ws://user:pass@localhost:8123/api/websocket']){
  assert.notEqual(checkHACatalogEndpoint(url).status,'approved_url');
 }
 assert.equal((await readCatalogViaHACoreWebSocket({url:'ws://localhost:8123/api/websocket'})).status,'unverified');
});
test('mock HA handshake and exactly five registry reads, never write commands',async()=>{
 const {FakeWebSocket,sends}=fakeWs();
 const r=await readCatalogViaHACoreWebSocket({
  url:'ws://192.168.1.55:8123/api/websocket',
  token:'only-a-fake-test-token-abc',WebSocketImpl:FakeWebSocket,timeoutMs:500
 });
 assert.equal(r.status,'validated_snapshot');
 assert.equal(r.counts.entities,1);
 assert.equal(r.counts.areas,1);
 assert.equal(r.authorizesRead,false);
 assert.equal(r.authorizesWrite,false);
 assert.deepEqual(sends.filter(x=>x.id).map(x=>x.type),HA_REGISTRY_READ_COMMANDS);
 assert.equal(sends.length,6);
 assert.doesNotMatch(JSON.stringify(r),/only-a-fake-test-token|light.kitchen|Kitchen/);
});
test('server rejection, unknown result ID, and malformed schema fail closed',async()=>{
 for(const options of [{errorAt:2},{wrongId:true}]){
  const {FakeWebSocket}=fakeWs(options);
  const r=await readCatalogViaHACoreWebSocket({
   url:'ws://localhost:8123/api/websocket',
   token:'only-a-fake-test-token-abc',WebSocketImpl:FakeWebSocket,timeoutMs:500
  });
  assert.equal(r.status,'unverified');
  assert.equal(r.authorizesWrite,false);
 }
});
