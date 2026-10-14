import test from 'node:test';
import assert from 'node:assert/strict';
import {createHAReadOnlyCatalogSession} from '../src/home/ha-ws-catalog-session.mjs';
import {answerHARegistryQuestion} from '../src/home/ha-catalog-questions.mjs';
const results={
 'config/floor_registry/list':[{floor_id:'ground',name:'Первый этаж'}],
 'config/area_registry/list':[{area_id:'kitchen',name:'Кухня',floor_id:'ground',labels:[]}],
 'config/device_registry/list':[{id:'abcd1234',area_id:'kitchen',labels:[]}],
 'config/entity_registry/list':[{entity_id:'light.kitchen',device_id:'abcd1234',area_id:null,labels:[],disabled_by:null,hidden_by:null}],
 'config/label_registry/list':[{label_id:'lighting',name:'Освещение'}]
};
const tick=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
function mockConnection(){
 const listeners=new Map(),events=new Map(),timers=new Map(),calls=[];
 let counter=0;
 const conn={
  calls,
  async sendMessagePromise(msg){calls.push(msg);return structuredClone(results[msg.type]);},
  async subscribeEvents(callback,type){events.set(type,callback);return async()=>{events.delete(type);};},
  addEventListener(type,callback){listeners.set(type,[...(listeners.get(type)??[]),callback]);},
  removeEventListener(type,callback){listeners.set(type,(listeners.get(type)??[]).filter(cb=>cb!==callback));},
  emit(type){for(const cb of listeners.get(type)??[])cb();},
  registryEvent(type){events.get(type)?.({event_type:type});},
  subscriptions:()=>events.size
 };
 const clock={
  setTimeoutFn(cb){const id=++counter;timers.set(id,cb);return id;},
  clearTimeoutFn(id){timers.delete(id);},
  async flush(){const callbacks=[...timers.values()];timers.clear();for(const cb of callbacks)cb();await tick();},
  count:()=>timers.size
 };
 return {conn,clock};
}
test('end-to-end injected HA session subscribes before five exact read calls',async()=>{
 const {conn,clock}=mockConnection();
 const session=createHAReadOnlyCatalogSession({connection:conn,...clock,debounceMs:100});
 assert.equal(session.getStatus().status,'stale');
 assert.equal((await session.start()).subscriptions,5);
 assert.equal(conn.subscriptions(),5);
 assert.equal(conn.calls.length,0);
 await clock.flush();
 assert.equal(session.getStatus().status,'fresh');
 assert.deepEqual(session.getStatus().counts,{
  floors:1,areas:1,devices:1,entities:1,labels:1,unassignedEntities:0,
  unassignedDevices:0,disabledEntities:0,hiddenEntities:0
 });
 assert.equal(conn.calls.length,5);
 assert.ok(conn.calls.every(x=>Object.keys(x).join(',')==='type'&&x.type.endsWith('/list')));
 assert.equal(session.getStatus().authorizesRead,false);
 assert.equal(session.getVerifiedCatalog().entities[0].actionApproved,false);
 await session.close();
 assert.equal(session.getVerifiedCatalog(),null);
 assert.equal(conn.subscriptions(),0);
});
test('zone changes and connection reconnect trigger fresh full five-read catalog',async()=>{
 const {conn,clock}=mockConnection();
 const session=createHAReadOnlyCatalogSession({connection:conn,...clock,debounceMs:100});
 await session.start();await clock.flush();
 conn.registryEvent('area_registry_updated');
 assert.equal(session.getStatus().status,'stale');
 conn.registryEvent('area_registry_updated');
 assert.equal(clock.count(),1);
 await clock.flush();
 assert.equal(session.getStatus().status,'fresh');
 assert.equal(conn.calls.length,10);
 conn.emit('disconnected');
 assert.equal(session.getStatus().status,'stale');
 assert.equal(clock.count(),0);
 conn.emit('ready');
 await clock.flush();
 assert.equal(session.getStatus().status,'fresh');
 assert.equal(conn.calls.length,15);
 await session.close();
 conn.registryEvent('area_registry_updated');
 assert.equal(clock.count(),0);
});
test('failing any registry read cannot advertise a fresh catalog',async()=>{
 const {conn,clock}=mockConnection();
 const original=conn.sendMessagePromise;
 conn.sendMessagePromise=async msg=>{
  if(msg.type==='config/entity_registry/list')throw Error('private failure');
  return original(msg);
 };
 const session=createHAReadOnlyCatalogSession({connection:conn,...clock,debounceMs:100});
 await session.start();await clock.flush();
 assert.equal(session.getStatus().status,'stale');
 assert.equal(session.getVerifiedCatalog(),null);
 assert.doesNotMatch(JSON.stringify(session.getStatus()),/private failure/);
 await session.close();
});

test('owner-driven area rename event makes previous answer stale then uses renamed area',async()=>{
 const {conn,clock}=mockConnection();
 let name='Кухня';
 const original=conn.sendMessagePromise;
 conn.sendMessagePromise=async msg=>msg.type==='config/area_registry/list'?
   [{area_id:'kitchen',name,floor_id:'ground',labels:[]}]:original(msg);
 const session=createHAReadOnlyCatalogSession({connection:conn,...clock,debounceMs:100});
 await session.start();await clock.flush();
 const initial=answerHARegistryQuestion(session,'Какие устройства есть на кухне?');
 assert.equal(initial.status,'answered');
 assert.match(initial.text,/Кухня/);
 name='Столовая';
 conn.registryEvent('area_registry_updated');
 assert.equal(answerHARegistryQuestion(session,'Какие устройства есть на кухне?').reason,'catalog_not_fresh');
 await clock.flush();
 assert.equal(answerHARegistryQuestion(session,'Какие устройства есть на кухне?').reason,'unsupported_question');
 const renamed=answerHARegistryQuestion(session,'Какие устройства есть в столовой?');
 assert.equal(renamed.status,'answered');
 assert.match(renamed.text,/Столовая/);
 assert.equal(renamed.authorizesWrite,false);
 await session.close();
});
