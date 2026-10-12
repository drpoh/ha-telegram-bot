import test from 'node:test';
import assert from 'node:assert/strict';
import {assessTwoPassRegistry} from '../src/decision/v3-registry-double-read.mjs';
const base=()=>({entities:[{entity_id:'light.a',device_id:'d1',area_id:'kitchen'}],devices:[{id:'d1',area_id:'kitchen'}],areas:[{area_id:'kitchen',name:'Kitchen'}]});
test('unchanged registries are consistency-only and order-independent',()=>{
 const a=base(),b=structuredClone(a);b.entities.reverse();
 const result=assessTwoPassRegistry({first:a,second:b});
 assert.equal(result.stable,true);assert.equal(result.authorization,false);
});
test('changes in each registry and malformed members reject',()=>{
 const a=base();
 for(const kind of ['entities','devices','areas']){
  const b=base();b[kind][0]={...b[kind][0],name:'modified'};
  assert.equal(assessTwoPassRegistry({first:a,second:b}).stable,false);
  const invalid=base();invalid[kind].push({...invalid[kind][0]});
  assert.equal(assessTwoPassRegistry({first:a,second:invalid}).stable,false);
 }
 assert.equal(assessTwoPassRegistry({first:a}).stable,false);
});
