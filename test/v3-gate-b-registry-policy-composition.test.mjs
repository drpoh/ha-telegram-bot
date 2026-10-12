import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectViaUpstreamConnection} from '../src/decision/v3-ha-upstream-read-bridge.mjs';
import {getV3ReviewedPolicy} from '../src/decision/v3-trusted-policy-source.mjs';
import {createV3TelegramJoinedAdapter} from '../src/decision/v3-telegram-joined-adapter.mjs';
import {createIsolatedV3JoinedChain} from '../src/decision/v3-isolated-joined-chain.mjs';

const intent={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.fixture'}};
const context={update:{update_id:991},from:{id:55},chat:{id:55,type:'private'},message:{message_id:101,from:{id:55},chat:{id:55},date:1000,text:'Включи весь свет в Комната'}};

test('upstream registry read-only evidence cannot become authorization in strict joined chain',async()=>{
 let reads=0,writes=0;
 const socket={};
 const connection={connected:true,closeRequested:false,socket,async sendMessagePromise({type}){
  reads++;
  assert.ok(['config/entity_registry/list','config/device_registry/list','config/area_registry/list'].includes(type));
  return [];
 }};
 const readEvidence=await inspectViaUpstreamConnection({connection});
 assert.equal(readEvidence.authorization,false);
 assert.equal(readEvidence.ready,false);
 assert.equal(reads,6);
 const joined=createIsolatedV3JoinedChain({
  telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),
  clock:()=>1000000,strictDispatchEvidence:true,
  policy:getV3ReviewedPolicy(),configPath:'/nonexistent-reviewed-policy',
  verifyRegistryAtDispatch:async()=>readEvidence,
  verifyApprovalAtDispatch:async()=>({valid:true}),
  readTool:async()=>{throw Error('no production read client');},
  simulateWrite:async()=>{writes++;throw Error('never write');},
 });
 const proposed=joined.issueFromTransport({ctx:context,action:intent});
 assert.equal(proposed.status,'pending');
 const denied=await joined.confirm({...proposed.actor,token:proposed.token});
 assert.notEqual(denied.status,'verified');
 assert.equal(writes,0);
});

test('default-deny V3 policy blocks even positive mock registry and approval attestations',async()=>{
 let writes=0;
 const joined=createIsolatedV3JoinedChain({
  telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),
  clock:()=>1000000,strictDispatchEvidence:true,
  policy:getV3ReviewedPolicy(),configPath:'/nonexistent-reviewed-policy',
  verifyRegistryAtDispatch:async()=>({valid:true}),
  verifyApprovalAtDispatch:async()=>({valid:true}),
  readTool:async()=>[],simulateWrite:async()=>{writes++;return {success:true};},
 });
 const pending=joined.issueFromTransport({ctx:context,action:intent});
 assert.equal(pending.status,'pending');
 const first=await joined.confirm({...pending.actor,token:pending.token});
 assert.notEqual(first.status,'verified');
 const replay=await joined.confirm({...pending.actor,token:pending.token});
 assert.notEqual(replay.status,'verified');
 assert.equal(writes,0);
});

test('missing dispatch approval source denies before any mock write',async()=>{
 let writes=0;
 const joined=createIsolatedV3JoinedChain({
  telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),
  clock:()=>1000000,strictDispatchEvidence:true,
  policy:getV3ReviewedPolicy(),configPath:'/nonexistent-reviewed-policy',
  verifyRegistryAtDispatch:async()=>({valid:true}),
  readTool:async()=>[],simulateWrite:async()=>{writes++;},
 });
 const pending=joined.issueFromTransport({ctx:context,action:intent});
 assert.equal(pending.status,'pending');
 assert.notEqual((await joined.confirm({...pending.actor,token:pending.token})).status,'verified');
 assert.equal(writes,0);
});
