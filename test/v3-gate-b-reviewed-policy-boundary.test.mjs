import test from 'node:test';
import assert from 'node:assert/strict';
import {getV3ReviewedPolicy,getLegacyPolicyInventory} from '../src/decision/v3-trusted-policy-source.mjs';
import {createIsolatedV3JoinedChain} from '../src/decision/v3-isolated-joined-chain.mjs';
import {createV3TelegramJoinedAdapter} from '../src/decision/v3-telegram-joined-adapter.mjs';

test('legacy v2 grants cannot enable a v3 action even with forged positive evidence callbacks',async()=>{
 const policy=getV3ReviewedPolicy();
 assert.equal(policy.default,'deny');
 assert.deepEqual(policy.entities,{});
 assert.ok(getLegacyPolicyInventory().count>0);
 let writes=0;
 const chain=createIsolatedV3JoinedChain({
  telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),
  clock:()=>1000000,strictDispatchEvidence:true,policy,configPath:'/absent-reviewed-policy',
  verifyRegistryAtDispatch:async()=>({valid:true}),verifyApprovalAtDispatch:async()=>({valid:true}),
  readTool:async()=>{throw Error('no live HA source');},
  simulateWrite:async()=>{writes++;throw Error('unexpected write');},
 });
 const ctx={update:{update_id:901},from:{id:55},chat:{id:55,type:'private'},message:{message_id:11,from:{id:55},chat:{id:55},date:1000,text:'Включи весь свет в Комната'}};
 const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.fixture'}};
 const admission=chain.issueFromTransport({ctx,action});
 assert.equal(admission.status,'pending');
 assert.notEqual((await chain.confirm({...admission.actor,token:admission.token})).status,'verified');
 assert.equal(writes,0);
});
