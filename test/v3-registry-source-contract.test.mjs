import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRegistrySourceContract} from '../src/decision/v3-registry-source-contract.mjs';
const source={kind:'dedicated_ha_registry_reader',readOnly:true,transportAuthenticated:true,operatorConfigured:true,completeRegistryGuaranteed:true,stableIdsGuaranteed:true};
const snapshot={success:true,complete:true,partial:false,has_more:false,next_offset:null,entities:[],devices:[],areas:[],entityCount:0,deviceCount:0,areaCount:0};
test('a complete claimed source is review-only, never execution authority',()=>{
 const r=assessRegistrySourceContract({source,snapshot});
 assert.equal(r.accepted,true);assert.equal(r.authorization,false);
});
test('missing source guarantees always fail closed',()=>{
 for(const key of ['readOnly','transportAuthenticated','operatorConfigured','completeRegistryGuaranteed','stableIdsGuaranteed']){
  assert.equal(assessRegistrySourceContract({source:{...source,[key]:false},snapshot}).accepted,false);
 }
 assert.equal(assessRegistrySourceContract({snapshot}).accepted,false);
});
test('incomplete and ambiguous inventory metadata fail closed',()=>{
 for(const changed of [{complete:false},{partial:true},{partial:undefined},{has_more:true},{has_more:undefined},{next_offset:4},{entityCount:1},{devices:null},{areaCount:-1}]){
  assert.equal(assessRegistrySourceContract({source,snapshot:{...snapshot,...changed}}).accepted,false);
 }
});
