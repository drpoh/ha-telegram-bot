import test from 'node:test';
import assert from 'node:assert/strict';
import {createHARegistryEventObserver} from '../src/home/ha-ws-registry-event-observer.mjs';
import {createHACatalogCoordinator} from '../src/home/ha-catalog-refresh-coordinator.mjs';
const snapshot=(areas=17)=>({status:'validated_snapshot',complete:true,
 authorizesRead:false,authorizesWrite:false,counts:{areas,entities:1},
 entities:[{entityId:'light.existing',readApproved:false,actionApproved:false}]
});
const tick=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function fake(){
 const listeners=new Map(),subscriptions=new Map(),timers=new Map();
 let sequence=0;
 const connection={
  async subscribeEvents(cb,type){subscriptions.set(type,cb);return async()=>subscriptions.delete(type);},
  addEventListener(type,cb){const all=listeners.get(type)??[];all.push(cb);listeners.set(type,all);},
  removeEventListener(type,cb){listeners.set(type,(listeners.get(type)??[]).filter(x=>x!==cb));},
  emit(type){for(const cb of listeners.get(type)??[])cb();},
  event(type){subscriptions.get(type)?.({event_type:type,data:{private:'do-not-log'}});}
 };
 const scheduler={
  setTimeoutFn(cb){const id=++sequence;timers.set(id,cb);return id;},
  clearTimeoutFn(id){timers.delete(id);},
  async fire(){const items=[...timers.values()];timers.clear();for(const cb of items)cb();await tick();},
  size:()=>timers.size
 };
 return {connection,subscriptions,scheduler};
}
test('area rename/move invalidates catalog, debounces to one reread',async()=>{
 const {connection,subscriptions,scheduler}=fake();
 let calls=0;
 const coordinator=createHACatalogCoordinator({fetchSnapshot:async()=>{calls++;return snapshot(calls===1?17:18);}});
 const observer=createHARegistryEventObserver({connection,coordinator,...scheduler,debounceMs:300});
 assert.equal((await observer.start()).subscriptions,5);
 assert.equal(subscriptions.size,5);
 await scheduler.fire();
 assert.equal(coordinator.getStatus().status,'fresh');
 connection.event('area_registry_updated');
 connection.event('area_registry_updated');
 connection.event('floor_registry_updated');
 assert.equal(coordinator.getStatus().status,'stale');
 assert.equal(scheduler.size(),1);
 await scheduler.fire();
 assert.equal(calls,2);
 assert.equal(coordinator.getStatus().coverage.areas,18);
 assert.equal(observer.status().authorizesWrite,false);
 await observer.stop();
 assert.equal(subscriptions.size,0);
 assert.equal(coordinator.getStatus().status,'stale');
});
test('disconnect removes freshness; ready enqueues complete refresh',async()=>{
 const {connection,scheduler}=fake();
 let n=0;
 const coordinator=createHACatalogCoordinator({fetchSnapshot:async()=>snapshot(++n)});
 const observer=createHARegistryEventObserver({connection,coordinator,...scheduler});
 await observer.start();await scheduler.fire();
 assert.equal(coordinator.getStatus().status,'fresh');
 connection.emit('disconnected');
 assert.equal(coordinator.getStatus().status,'stale');
 assert.equal(scheduler.size(),0);
 connection.emit('ready');
 assert.equal(scheduler.size(),1);
 await scheduler.fire();
 assert.equal(coordinator.getStatus().status,'fresh');
 assert.equal(n,2);
 await observer.stop();
 connection.emit('ready');
 assert.equal(scheduler.size(),0);
});
test('changes while refresh is running must not publish stale snapshot',async()=>{
 const {connection,scheduler}=fake();
 let resolveFirst,n=0;
 const coordinator=createHACatalogCoordinator({fetchSnapshot:async()=>++n===1?
  await new Promise(r=>{resolveFirst=r;}):snapshot(18)});
 const observer=createHARegistryEventObserver({connection,coordinator,...scheduler});
 await observer.start();await scheduler.fire();
 connection.event('area_registry_updated');
 resolveFirst(snapshot(17));
 await tick();
 assert.equal(coordinator.getStatus().status,'stale');
 await scheduler.fire();
 assert.equal(coordinator.getStatus().status,'fresh');
 assert.equal(coordinator.getStatus().coverage.areas,18);
 await observer.stop();
});
test('subscription failures safely roll back listeners/subscriptions',async()=>{
 const {connection,subscriptions,scheduler}=fake();
 const real=connection.subscribeEvents;
 connection.subscribeEvents=async(cb,type)=>type==='device_registry_updated'?
  Promise.reject(Error('sensitive')):real(cb,type);
 const coordinator=createHACatalogCoordinator({fetchSnapshot:async()=>snapshot()});
 const observer=createHARegistryEventObserver({connection,coordinator,...scheduler});
 await assert.rejects(observer.start(),/registry_subscription_failed/);
 assert.equal(subscriptions.size,0);
 assert.equal(observer.status().status,'stopped');
 connection.emit('ready');
 assert.equal(scheduler.size(),0);
});
