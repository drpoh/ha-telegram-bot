import test from 'node:test';
import assert from 'node:assert/strict';
import {createNineLightTestHarness} from '../src/home/nine-light-e2e-harness.mjs';
import {RESPONDING_NEW_LIGHT_IDS} from '../src/home/responding-new-light-batch.mjs';
const actor={userId:111,chatId:111};
const journal=()=>({claim:()=>true,mark:()=>true});
test('all nine /confirm attempts are non-operative by default even with a mocked MCP connection',async()=>{
 let writes=0;
 const client=createNineLightTestHarness({executionJournal:journal(),approvedIds:RESPONDING_NEW_LIGHT_IDS,
  verifyAdmission:async()=>({valid:true}),callTool:async(name)=>{if(name==='ha_call_service')writes++;return {};}});
 for(const entityId of RESPONDING_NEW_LIGHT_IDS){
  assert.equal(client.request(actor,{entityId,service:'turn_on'}).status,'pending');
  assert.equal((await client.confirm(actor)).reason,'release_disabled');
 }
 assert.equal(writes,0);
});
test('approved exact target + trusted admission + /confirm executes one service call and read verification',async()=>{
 const id='light.kukhnia_svet',calls=[];
 const client=createNineLightTestHarness({executionJournal:journal(),approvedIds:[id],releaseEnabled:true,
  verifyAdmission:async()=>({valid:true}),
  callTool:async(name,args)=>{calls.push(name);return name==='ha_get_state'?{data:{entity_id:id,state:'on'}}:{isError:false};}
 });
 assert.equal(client.request(actor,{entityId:id,service:'turn_on'}).requires,'/confirm');
 assert.equal(calls.length,0);
 assert.equal((await client.confirm(actor)).status,'verified');
 assert.deepEqual(calls,['ha_get_state','ha_call_service','ha_get_state']);
 assert.equal((await client.confirm(actor)).status,'missing');
});
test('nine-light list cannot bypass actual individually approved target set',async()=>{
 let writes=0;
 const client=createNineLightTestHarness({executionJournal:journal(),releaseEnabled:true,approvedIds:['light.kukhnia_svet'],
  verifyAdmission:async()=>({valid:true}),callTool:async name=>{if(name==='ha_call_service')writes++;return {};}});
 client.request(actor,{entityId:'light.wled_gledopto',service:'turn_off'});
 assert.equal((await client.confirm(actor)).reason,'out_of_scope');
 assert.equal(writes,0);
});
