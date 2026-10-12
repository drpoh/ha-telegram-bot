import test from 'node:test';
import assert from 'node:assert/strict';
import {createIsolatedV3JoinedChain} from '../src/decision/v3-isolated-joined-chain.mjs';
import {createV3TelegramJoinedAdapter} from '../src/decision/v3-telegram-joined-adapter.mjs';
const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.fixture'}};
const ctx=()=>({update:{update_id:101},from:{id:55},chat:{id:55,type:'private'},message:{message_id:4,from:{id:55},chat:{id:55},date:1000,text:'Включи весь свет в Комната'}});
test('joined adapter denies spoofing and replay before issuing consent',()=>{
 const chain=createIsolatedV3JoinedChain({telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),clock:()=>1000000,policy:{},configPath:'/none',readTool:async()=>{throw Error('unexpected read')},simulateWrite:async()=>{throw Error('unexpected write')}});
 const bad=ctx();bad.message.from.id=77;
 assert.equal(chain.issueFromTransport({ctx:bad,action}).status,'denied');
 assert.equal(chain.issue({ctx:ctx(),action}).status,'denied');
 const pending=chain.issueFromTransport({ctx:ctx(),action});
 assert.equal(pending.status,'pending');
 assert.equal(chain.issueFromTransport({ctx:ctx(),action}).reason,'duplicate_transport_message');
 assert.equal(chain.cancel({userId:55,chatId:55}),true);
 assert.equal(chain.cancel({userId:55,chatId:55}),false);
});
test('joined adapter declines stale and group chat messages',()=>{
 const chain=createIsolatedV3JoinedChain({telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),clock:()=>1000000,policy:{},configPath:'/none',readTool:async()=>{throw Error('unexpected read')},simulateWrite:async()=>{throw Error('unexpected write')}});
 const group=ctx();group.chat.type='group';assert.equal(chain.issueFromTransport({ctx:group,action}).status,'denied');
 const stale=ctx();stale.message.date=900;assert.equal(chain.issueFromTransport({ctx:stale,action}).status,'denied');
});

test('strict joined path fails closed without independent registry and approval evidence',async()=>{
 let writes=0;
 for(const evidence of [
  {},
  {verifyRegistryAtDispatch:async()=>({valid:true})},
  {verifyApprovalAtDispatch:async()=>({valid:true})},
  {verifyRegistryAtDispatch:async()=>({valid:true}),verifyApprovalAtDispatch:async()=>({valid:false})},
 ]){
  const chain=createIsolatedV3JoinedChain({
   telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),
   clock:()=>1000000,strictDispatchEvidence:true,
   policy:{entities:{'light.fixture':{level:'confirm',services:['turn_on']}}},
   configPath:'/no-real-policy',
   readTool:async()=>{throw Error('offline read disabled');},
   simulateWrite:async()=>{writes++;throw Error('unexpected write');},
   ...evidence,
  });
  const pending=chain.issueFromTransport({ctx:ctx(),action});
  assert.equal(pending.status,'pending');
  const result=await chain.confirm({...pending.actor,token:pending.token});
  assert.notEqual(result.status,'verified');
  assert.equal(writes,0);
 }
});

test('strict joined Telegraf ingress requires raw event and binds confirmed action to actor',async()=>{
 const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs');
 const {tmpdir}=await import('node:os');
 const {join}=await import('node:path');
 const dir=mkdtempSync(join(tmpdir(),'v3-joined-strict-'));
 try{
  const configPath=join(dir,'approved-area.json');
  writeFileSync(configPath,JSON.stringify({version:1,areas:[{area_id:'room',area_name:'Комната',light_ids:['light.fixture'],excluded_light_ids:[],switch_light_ids:[]}]}));
  let state='off',writes=0,registryChecks=0,approvalChecks=0;
  const readTool=async(name,args)=>{
   if(name==='ha_list_floors_areas')return {structuredContent:{success:true,floors:[{areas:[{area_id:'room',name:'Комната'}]}],unassigned_areas:[]}};
   if(name==='ha_search')return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==='light'?1:0,entities:args.domain_filter==='light'?[{entity_id:'light.fixture',domain:'light',area:'Комната'}]:[]}};
   if(name==='ha_get_state')return {structuredContent:{data:{entity_id:args.entity_id,state}}};
   throw Error('unexpected_read');
  };
  const chain=createIsolatedV3JoinedChain({
   telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000,requireRawMessage:true}),
   clock:()=>1000000,strictDispatchEvidence:true,configPath,readTool,
   policy:{default:'deny',entities:{'light.fixture':{level:'confirm',services:['turn_on']}}},
   verifyRegistryAtDispatch:async()=>{registryChecks++;return {valid:true};},
   verifyApprovalAtDispatch:async()=>{approvalChecks++;return {valid:true};},
   simulateWrite:async()=>{writes++;state='on';return {structuredContent:{success:true}};},
  });
  const missing=chain.issueFromTransport({ctx:ctx(),action});
  assert.equal(missing.status,'denied');
  const original=ctx();original.update.message={...original.message};
  const issued=chain.issueFromTransport({ctx:original,action});
  assert.equal(issued.status,'pending');
  assert.equal((await chain.confirm({userId:56,chatId:55,token:issued.token})).status,'missing');
  assert.equal(writes,0);
  assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,'verified');
  assert.equal(writes,1);assert.equal(registryChecks,1);assert.equal(approvalChecks,1);
  assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,'missing');
  assert.equal(writes,1);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('strict joined adapter denies a replayed source message across adapter restart',async()=>{
 const {mkdtempSync,rmSync}=await import('node:fs');
 const {tmpdir}=await import('node:os');
 const {join}=await import('node:path');
 const {createDurableAssistReplay}=await import('../src/decision/v3-assist-durable-replay.mjs');
 const dir=mkdtempSync(join(tmpdir(),'v3-joined-replay-'));
 try{
  const make=()=>createIsolatedV3JoinedChain({
   telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000,
    requireRawMessage:true,durableReplay:createDurableAssistReplay({directory:dir})}),
   clock:()=>1000000,policy:{default:'deny',entities:{}},configPath:'/no-live-policy',
   readTool:async()=>{throw Error('forbidden');},simulateWrite:async()=>{throw Error('forbidden');},
  });
  const raw=ctx();raw.update.message={...raw.message};
  assert.equal(make().issueFromTransport({ctx:raw,action}).status,'pending');
  const again=ctx();again.update.update_id=102;again.update.message={...again.message};
  const rejected=make().issueFromTransport({ctx:again,action});
  assert.equal(rejected.status,'denied');
  assert.equal(rejected.reason,'replayed_event');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
