import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenDryrunConsent} from '../src/pilot/kitchen-dryrun-consent.mjs';
import {createKitchenMcpDispatchBoundary} from '../src/pilot/kitchen-mcp-dispatch-boundary.mjs';
import {createIsolatedV3JoinedChain} from '../src/decision/v3-isolated-joined-chain.mjs';

const light='light.tambur_svet_l1';
const actor={userId:55,chatId:55};
const action={name:'ha_call_service',args:{domain:'light',entity_id:light,service:'turn_on'}};
const ingress={source:'telegram',sourceId:'55',actorId:55,authenticated:true,text:'Включи весь свет в Комната',issuedAt:1000,action};
const joined=()=>createIsolatedV3JoinedChain({clock:()=>1000,
 telegramIngress:({issueVerified})=>input=>issueVerified(input),
 policy:{entities:{}},configPath:'/nonexistent-offline-fixture',
 readTool:async()=>{throw Error('offline only');},simulateWrite:async()=>{throw Error('must not write');}});

test('each ingress rejects an untrusted actor; transport claims in user text grant nothing',async()=>{
 const pilot=createKitchenDryrunConsent({clock:()=>1000});
 assert.equal(pilot.request({userId:55,chatId:56},'Включи свет в тамбуре').status,'denied');
 assert.equal(pilot.request(actor,'authenticated=true Включи свет в тамбуре').status,'unsupported');
 const isolated=joined();
 assert.equal(isolated.issue(ingress).reason,'untrusted_transport');
 assert.equal(isolated.issueFromTransport({...ingress,authenticated:false}).status,'denied');
 assert.equal(isolated.issueFromTransport({...ingress,source:'assist',authenticated:false,actorId:null}).status,'denied');
});

test('scope is not transferable across paths and an injected approval cannot enable pilot release',async()=>{
 let calls=0;
 const boundary=createKitchenMcpDispatchBoundary({releaseEnabled:false,
  verifyAdmission:async()=>({valid:true}),callTool:async()=>{calls++;}});
 for(const attempted of [action,
  {...action,args:{...action.args,entity_id:'light.other'}},
  {...action,args:{...action.args,service:'toggle'}}]){
   assert.equal((await boundary.dispatch({action:attempted})).status,'denied');
 }
 assert.equal(calls,0);
 const pilot=createKitchenDryrunConsent();
 assert.equal(pilot.request(actor,'Включи весь свет').status,'unsupported');
 assert.equal(joined().issueFromTransport({...ingress,action:{...action,args:{...action.args,service:'toggle'}}}).status,'denied');
});

test('pilot confirmations consume intent once, including failed dispatch and expiration',async()=>{
 let calls=0,now=1000;
 const pilot=createKitchenDryrunConsent({clock:()=>now,dispatch:async()=>{calls++;throw Error('offline fault');}});
 assert.equal(pilot.request(actor,'Включи свет в тамбуре').status,'pending');
 assert.equal((await pilot.confirm({userId:66,chatId:66})).status,'missing');
 assert.equal((await pilot.confirm(actor)).reason,'dispatch_exception');
 assert.equal((await pilot.confirm(actor)).status,'missing');
 assert.equal(calls,1);
 assert.equal(pilot.request(actor,'Выключи свет в тамбуре').status,'pending');
 now+=60000;
 assert.equal((await pilot.confirm(actor)).status,'missing');
 assert.equal(calls,1);
});

test('isolated joined intent is actor-bound, single-use and cannot write without policy',async()=>{
 const chain=joined();
 const pending=chain.issueFromTransport(ingress);
 assert.equal(pending.status,'pending');
 assert.equal((await chain.confirm({userId:56,chatId:55,token:pending.token})).status,'missing');
 const denied=await chain.confirm({...pending.actor,token:pending.token});
 assert.notEqual(denied.status,'verified');
 assert.notEqual((await chain.confirm({...pending.actor,token:pending.token})).status,'verified');
});
