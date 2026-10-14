import test from 'node:test';
import assert from 'node:assert/strict';
import {createHACatalogCoordinator} from '../src/home/ha-catalog-refresh-coordinator.mjs';
const snapshot=(count=2)=>({
 status:'validated_snapshot',complete:true,authorizesRead:false,
 authorizesWrite:false,counts:{entities:count,areas:17},
 entities:Array.from({length:count},(_,i)=>({entityId:'light.x'+i}))
});
test('room catalog stays stale until full verified snapshot',async()=>{
 const c=createHACatalogCoordinator({fetchSnapshot:async()=>snapshot()});
 assert.equal(c.getStatus().status,'stale');
 assert.equal(c.getVerifiedCatalog(),null);
 assert.equal((await c.refresh()).status,'fresh');
 assert.equal(c.getVerifiedCatalog().counts.areas,17);
 assert.equal(c.changed('area_registry_updated').status,'stale');
 assert.equal(c.getVerifiedCatalog(),null);
 assert.equal((await c.refresh()).status,'fresh');
 assert.equal(c.getStatus().authorizesWrite,false);
});
test('changed rooms during in-flight refresh prevent stale commit',async()=>{
 let done;let fetches=0;
 const c=createHACatalogCoordinator({fetchSnapshot:async()=>{fetches++;
  return fetches===1?await new Promise(resolve=>{done=resolve;}):snapshot(3);
 }});
 const pending=c.refresh();
 c.changed('area_registry_updated');
 done(snapshot(2));
 assert.equal((await pending).reason,'concurrent_change');
 assert.equal(c.getVerifiedCatalog(),null);
 assert.equal((await c.refresh()).status,'fresh');
 assert.equal(c.getVerifiedCatalog().counts.entities,3);
});
test('disconnect and unknown registry change both require resnapshot',async()=>{
 const c=createHACatalogCoordinator({fetchSnapshot:async()=>snapshot()});
 await c.refresh();
 assert.equal(c.disconnected().status,'stale');
 assert.equal(c.getVerifiedCatalog(),null);
 await c.refresh();
 assert.equal(c.changed('unknown-event').status,'stale');
 assert.equal(c.getVerifiedCatalog(),null);
});
test('incomplete, exceptions and stopped coordinator fail closed',async()=>{
 const bad=createHACatalogCoordinator({fetchSnapshot:async()=>({status:'validated_snapshot',complete:false})});
 assert.equal((await bad.refresh()).status,'stale');
 const broken=createHACatalogCoordinator({fetchSnapshot:async()=>{throw Error('secret');}});
 assert.equal((await broken.refresh()).reason,'read_failure');
 assert.doesNotMatch(JSON.stringify(broken.getStatus()),/secret/);
 const c=createHACatalogCoordinator({fetchSnapshot:async()=>snapshot()});
 await c.refresh();
 assert.equal(c.stop().status,'stale');
 assert.equal((await c.refresh()).reason,'stopped');
 assert.equal(c.getVerifiedCatalog(),null);
});
test('duplicate refreshes use the same in-flight reader',async()=>{
 let finish,n=0;
 const c=createHACatalogCoordinator({fetchSnapshot:async()=>{n++;return await new Promise(resolve=>{finish=resolve;});}});
 const a=c.refresh(),b=c.refresh();
 assert.equal(n,1);
 finish(snapshot());
 assert.equal((await a).status,'fresh');
 assert.equal((await b).status,'fresh');
});
