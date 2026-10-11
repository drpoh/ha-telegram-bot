import test from 'node:test';import assert from 'node:assert/strict';
import {createStageBatchConsent} from '../src/ops/stage-batch-consent.mjs';
let now=500000;const policy={version:1,default:'deny',entities:{'light.a':{level:'confirm',services:['turn_on','turn_off']},'light.b':{level:'confirm',services:['turn_on','turn_off']}}};
const actor={userId:22,chatId:22};
const e=(id,device='d'+id,area='tambur',available=true)=>({entityId:id,name:id,deviceId:device,areaId:area,disabled:false,available});
const first=e('light.a'),second=e('light.b');
const snapshot=(items=[first,second],age=now)=>({complete:true,partial:false,has_more:false,next_offset:null,capturedAt:age,entities:items});
const req=[{name:'light.a',areaId:'tambur'},{name:'light.b',areaId:'tambur'}];
test('two lights yield non-authorizing simulation only',()=>{const s=createStageBatchConsent({clock:()=>now,policy});const p=s.issue({actor,requests:req,snapshot:snapshot()});assert.equal(p.status,'pending');assert.deepEqual(s.confirm({actor,token:p.token,snapshot:snapshot()}),{status:'simulated',authorized:false,actualWrite:false,entityIds:['light.a','light.b']});});
test('missing or changed second member invalidates entire batch without partial action',()=>{for(const items of [[first],[first,e('light.b','replacement')],[first,e('light.b','dlight.b','tambur',false)]]){const s=createStageBatchConsent({clock:()=>now,policy});const p=s.issue({actor,requests:req,snapshot:snapshot()});const result=s.confirm({actor,token:p.token,snapshot:snapshot(items)});assert.equal(result.status,'denied');assert.equal(result.actualWrite,false);}});
test('duplicate, ambiguous or stale batch fails before pending intent',()=>{const s=createStageBatchConsent({clock:()=>now,policy});assert.equal(s.issue({actor,requests:[req[0],req[0]],snapshot:snapshot()}).reason,'duplicate_target');assert.equal(s.issue({actor,requests:req,snapshot:snapshot([first,second],now-30001)}).status,'denied');});
test('token cannot be claimed twice or by other actor',async()=>{const s=createStageBatchConsent({clock:()=>now,policy});const p=s.issue({actor,requests:req,snapshot:snapshot()});assert.equal(s.confirm({actor:{userId:99,chatId:99},token:p.token,snapshot:snapshot()}).status,'denied');const results=await Promise.all(Array.from({length:20},()=>Promise.resolve().then(()=>s.confirm({actor,token:p.token,snapshot:snapshot()}))));assert.equal(results.filter(x=>x.status==='simulated').length,1);});

test('cancel is actor- and token-bound and consumes only matching pending batch',()=>{
 const s=createStageBatchConsent({clock:()=>now,policy});const p=s.issue({actor,requests:req,snapshot:snapshot()});
 assert.equal(s.cancel({actor:{userId:33,chatId:33},token:p.token}),false);
 assert.equal(s.cancel({actor,token:'wrong-token'}),false);
 assert.equal(s.cancel({actor,token:p.token}),true);
 assert.equal(s.confirm({actor,token:p.token,snapshot:snapshot()}).reason,'missing_expired_or_used_intent');
});
test('batch defaults deny without explicit valid reviewed scope fixture',()=>{
 const s=createStageBatchConsent({clock:()=>now});
 assert.equal(s.issue({actor,requests:req,snapshot:snapshot()}).reason,'stage_policy_invalid');
 const partial=createStageBatchConsent({clock:()=>now,policy:{version:1,default:'deny',entities:{'light.a':{level:'confirm',services:['turn_on','turn_off']}}}});
 assert.equal(partial.issue({actor,requests:req,snapshot:snapshot()}).reason,'stage_scope_not_reviewed');
 const narrow=createStageBatchConsent({clock:()=>now,policy:{version:1,default:'deny',entities:{'light.a':{level:'confirm',services:['turn_on','turn_off']},'light.b':{level:'confirm',services:['turn_off']}}}});
 assert.equal(narrow.issue({actor,requests:req,snapshot:snapshot()}).reason,'stage_scope_not_reviewed');
});
test('renamed, ambiguous, cross-area or unrecognized group member is denied without partial simulation',()=>{
 for(const items of [[first,{...second,name:'changed'}],[first,second,{...e('light.c'),name:'light.b'}],[first,{...second,areaId:'other'}]]){
  const s=createStageBatchConsent({clock:()=>now,policy});const p=s.issue({actor,requests:req,snapshot:snapshot()});
  assert.equal(p.status,'pending');const outcome=s.confirm({actor,token:p.token,snapshot:snapshot(items)});
  assert.equal(outcome.status,'denied');assert.equal(outcome.actualWrite,false);
 }
});
