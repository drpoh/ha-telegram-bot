import test from 'node:test';
import assert from 'node:assert/strict';
import {createIsolatedV3JoinedChain} from '../src/decision/v3-isolated-joined-chain.mjs';
import {createV3TelegramJoinedAdapter} from '../src/decision/v3-telegram-joined-adapter.mjs';
const members=Array.from({length:14},(_,i)=>'light.mock_'+i);
const action={name:'ha_call_service',args:{domain:'light',service:'turn_off',entity_id:'light.ves_svet'}};
const ctx=()=>({update:{update_id:101},from:{id:55},chat:{id:55,type:'private'},message:{message_id:8,from:{id:55},chat:{id:55},date:1000,text:'Выключи весь свет'}});
test('whole-house mock rechecks registry after member read, before write',async()=>{
 let writes=0,valid=false;
 const chain=createIsolatedV3JoinedChain({clock:()=>1000000,telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),
  policy:{entities:{}},configPath:'/unused',readTool:async()=>{},simulateWrite:async()=>{writes++;return {success:true}},
  verifyRegistryAtDispatch:async()=>({valid}),wholeHouseOff:{enabled:true,policy:{default:'deny',entities:{'light.ves_svet':{level:'confirm',services:['turn_off']}}},reviewedMembers:members,readGroup:async()=>({entity_id:'light.ves_svet',platform:'group',attributes:{entity_id:members}})}});
 const issued=chain.issueFromTransport({ctx:ctx(),action});assert.equal(issued.status,'pending');
 assert.equal((await chain.confirm({...issued.actor,token:issued.token})).reason,'registry_changed_or_unverified');assert.equal(writes,0);
 valid=true;assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,'missing');
 const next=ctx();next.update.update_id=102;next.message.message_id=9;
 const fresh=chain.issueFromTransport({ctx:next,action});assert.equal(fresh.status,'pending');
 assert.equal((await chain.confirm({...fresh.actor,token:fresh.token})).status,'simulated');assert.equal(writes,1);
 assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,'missing');
});
