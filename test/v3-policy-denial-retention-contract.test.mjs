import test from 'node:test';
import assert from 'node:assert/strict';
import {createIsolatedV3JoinedChain} from '../src/decision/v3-isolated-joined-chain.mjs';

test('offline policy denial retains pending intent but never triggers a write',async()=>{
 let writes=0;
 const chain=createIsolatedV3JoinedChain({
  clock:()=>1000,
  telegramIngress:({issueVerified})=>input=>issueVerified(input),
  policy:{entities:{}},configPath:'/nonexistent-offline-fixture',
  readTool:async()=>{throw Error('offline only');},
  simulateWrite:async()=>{writes++;throw Error('forbidden');},
 });
 const pending=chain.issueFromTransport({
  source:'telegram',sourceId:'55',actorId:55,authenticated:true,
  text:'Включи весь свет в Комната',issuedAt:1000,
  action:{name:'ha_call_service',args:{domain:'light',entity_id:'light.tambur_svet_l1',service:'turn_on'}},
 });
 assert.equal(pending.status,'pending');
 const args={...pending.actor,token:pending.token};
 assert.equal((await chain.confirm(args)).status,'denied');
 assert.equal((await chain.confirm(args)).status,'denied');
 assert.equal(writes,0);
});
