import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageConsentSimulation} from '../src/ops/stage-consent-simulation.mjs';
const actor={userId:9,chatId:9};let now=1000000;
const e=(deviceId='d1',available=true)=>({entityId:'light.tambur_1',name:'Свет',areaId:'tambur',deviceId,available,disabled:false});
const snap=(entities=[e()])=>({complete:true,partial:false,has_more:false,next_offset:null,capturedAt:now,entities});
const request=(s,initialSnapshot=snap())=>s.issue({actor,name:'Свет',areaId:'tambur',initialSnapshot});
test('private stage confirmation returns simulation but never real write authority',()=>{
 const s=createStageConsentSimulation({clock:()=>now});const r=request(s);
 assert.equal(r.status,'pending');
 assert.deepEqual(s.confirm({actor,token:r.token,currentSnapshot:snap()}),{status:'simulated',authorized:false,actualWrite:false,entityId:'light.tambur_1'});
 assert.equal(s.confirm({actor,token:r.token,currentSnapshot:snap()}).reason,'missing_expired_or_used_intent');
});
test('replaced, missing, unavailable or stale target consumes intent without action',()=>{
 for(const currentSnapshot of [snap([e('replacement')]),snap([]),snap([e('d1',false)]),{...snap(),capturedAt:now-30001}]){
  const s=createStageConsentSimulation({clock:()=>now});const r=request(s);
  const result=s.confirm({actor,token:r.token,currentSnapshot});
  assert.equal(result.status,'denied');assert.equal(result.actualWrite,false);
  assert.equal(s.confirm({actor,token:r.token,currentSnapshot:snap()}).status,'denied');
 }
});
test('cross actor, expiration and concurrent replay block',async()=>{
 const s=createStageConsentSimulation({clock:()=>now});const r=request(s);
 assert.equal(s.confirm({actor:{userId:3,chatId:3},token:r.token,currentSnapshot:snap()}).status,'denied');
 const results=await Promise.all(Array.from({length:24},()=>Promise.resolve().then(()=>s.confirm({actor,token:r.token,currentSnapshot:snap()}))));
 assert.equal(results.filter(x=>x.status==='simulated').length,1);
 const next=request(s);now+=60000;
 assert.equal(s.confirm({actor,token:next.token,currentSnapshot:snap()}).reason,'missing_expired_or_used_intent');
});
