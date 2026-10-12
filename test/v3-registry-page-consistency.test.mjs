import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRegistryPages} from '../src/decision/v3-registry-page-consistency.mjs';
const first={success:true,partial:false,offset:0,total:2,generation:'g1',has_more:true,next_offset:1,records:[{id:'a'}]};
const second={success:true,partial:false,offset:1,total:2,generation:'g1',has_more:false,next_offset:null,records:[{id:'b'}]};
const check=(pages=[first,second],expectedCount=2)=>assessRegistryPages({pages,expectedCount});
test('matching pages remain offline-only, without authorization',()=>{
 const v=check();assert.equal(v.consistent,true);assert.equal(v.authorization,false);
});
test('pagination, drift, duplicate and partial failures deny',()=>{
 const variants=[[first,{...second,generation:'g2'}],[first,{...second,offset:0}],
  [first,{...second,records:[{id:'a'}]}],[first,{...second,partial:true}],
  [{...first,next_offset:2},second],[{...first,has_more:false},second],
  [first,{...second,total:3}],[first,{...second,next_offset:2}],
  [first,{...second,records:[]}],[{...first,generation:''},second]];
 for(const p of variants){const v=check(p);assert.equal(v.consistent,false);assert.equal(v.authorization,false);}
 assert.equal(check([first]).consistent,false);
 assert.equal(check([first,second],3).consistent,false);
});
