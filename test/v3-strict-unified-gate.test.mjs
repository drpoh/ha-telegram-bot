import test from 'node:test';
import assert from 'node:assert/strict';
import {createIsolatedV3JoinedChain} from '../src/decision/v3-isolated-joined-chain.mjs';
import {createV3TelegramJoinedAdapter} from '../src/decision/v3-telegram-joined-adapter.mjs';
const members=Array.from({length:14},(_,i)=>'light.mock_'+i);
const action={name:'ha_call_service',args:{domain:'light',service:'turn_off',entity_id:'light.ves_svet'}};
const ctx=()=>({update:{update_id:101},from:{id:55},chat:{id:55,type:'private'},message:{message_id:8,from:{id:55},chat:{id:55},date:1000,text:'Выключи весь свет'}});
const make=(extra={})=>{
 let writes=0;
 const chain=createIsolatedV3JoinedChain({strictDispatchEvidence:true,clock:()=>1000000,
  telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),
  policy:{entities:{}},configPath:'/unused',readTool:async()=>{},
  simulateWrite:async()=>{writes++;return {success:true}},
  wholeHouseOff:{enabled:true,policy:{default:'deny',entities:{'light.ves_svet':{level:'confirm',services:['turn_off']}}},reviewedMembers:members,readGroup:async()=>({entity_id:'light.ves_svet',platform:'group',attributes:{entity_id:members}})},...extra});
 return {chain,getWrites:()=>writes};
};
test('strict gate denies missing mandatory approval or registry callbacks',async()=>{
 for(const extra of [{},{verifyRegistryAtDispatch:async()=>({valid:true})},{verifyApprovalAtDispatch:async()=>({valid:true})}]){
  const {chain,getWrites}=make(extra),issued=chain.issueFromTransport({ctx:ctx(),action});
  assert.equal(issued.status,'pending');
  assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,'denied');
  assert.equal(getWrites(),0);
 }
});
test('strict gate requires both verifiers and denies either rejection',async()=>{
 for(const [registry,approval] of [[false,true],[true,false],[true,true]]){
  const calls=[];
  const {chain,getWrites}=make({verifyRegistryAtDispatch:async()=>{calls.push('registry');return {valid:registry}},verifyApprovalAtDispatch:async()=>{calls.push('approval');return {valid:approval}}});
  const issued=chain.issueFromTransport({ctx:ctx(),action});
  const confirmed=await chain.confirm({...issued.actor,token:issued.token});
  assert.equal(getWrites(),registry&&approval?1:0);
  assert.equal(confirmed.status,registry&&approval?'simulated':'denied');
  assert.equal(calls[0],'registry');
 }
});
