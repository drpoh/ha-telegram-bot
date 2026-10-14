import test from 'node:test';
import assert from 'node:assert/strict';
import {createRegistryFreshness} from '../src/home/ha-ws-registry-freshness.mjs';
test('fresh only after complete snapshot; one known event marks dirty',()=>{
 const r=createRegistryFreshness();
 assert.equal(r.status().fresh,false);
 assert.equal(r.status().dirtySections.length,5);
 assert.equal(r.markSnapshotValid().fresh,true);
 let s=r.observeEvent('label_registry_updated');
 assert.equal(s.fresh,false);
 assert.deepEqual(s.dirtySections,['labels']);
 assert.equal(s.needsFullRefresh,true);
 assert.equal(s.authorizesWrite,false);
 assert.equal(r.markSnapshotValid().fresh,true);
});
test('unknown events and disconnect force full refresh, never stale claims',()=>{
 const r=createRegistryFreshness();
 r.markSnapshotValid();
 assert.equal(r.observeEvent('unexpected_registry_event').dirtySections.length,5);
 r.markSnapshotValid();
 assert.equal(r.disconnected().dirtySections.length,5);
 assert.equal(r.status().fresh,false);
});
