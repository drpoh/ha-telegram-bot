import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_LIGHT_IDS} from '../src/home/new-light-candidates.mjs';
import {NEW_LIGHT_OBSERVED_SNAPSHOT,summarizeNewLightObservation} from '../src/home/new-light-observed-snapshot.mjs';

test('owner Pi observation counts exact 19 scoped candidate IDs without new authorizations',()=>{
 const r=summarizeNewLightObservation();
 assert.equal(r.status,'partial');
 assert.deepEqual(r.counts,{on:1,off:8,unknown:10});
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.deepEqual(NEW_LIGHT_OBSERVED_SNAPSHOT.map(x=>x.id),NEW_LIGHT_IDS);
 assert.ok(NEW_LIGHT_OBSERVED_SNAPSHOT.every(x=>!x.id.startsWith('light.browser_mod')));
});
test('incomplete and spoofed snapshots are rejected',()=>{
 for(const sample of [
  NEW_LIGHT_OBSERVED_SNAPSHOT.slice(1),
  NEW_LIGHT_OBSERVED_SNAPSHOT.map((x,i)=>i===0?{...x,id:'light.browser_mod_forged'}:x),
  NEW_LIGHT_OBSERVED_SNAPSHOT.map((x,i)=>i===0?{...x,state:'disabled'}:x)
 ]){
  const result=summarizeNewLightObservation(sample);
  assert.equal(result.status,'invalid');assert.equal(result.authorization,false);assert.equal(result.actualWrite,false);
 }
});
