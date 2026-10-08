import test from "node:test";
import assert from "node:assert/strict";
import {createIsolatedV3JoinedChain} from "../src/decision/v3-isolated-joined-chain.mjs";
import {createV3TelegramIngressFixture} from "../src/decision/v3-telegram-ingress-fixture.mjs";

const members=Array.from({length:14},(_,i)=>"light.mock_"+i);
const action={name:"ha_call_service",args:{domain:"light",service:"turn_off",entity_id:"light.ves_svet"}};
const ctx={from:{id:55},chat:{id:66},message:{from:{id:55},chat:{id:66},date:1000,text:"Выключи весь свет"}};
test("joined Telegram provenance and approved group scope dispatch exactly once",async()=>{
 let writes=0;
 const chain=createIsolatedV3JoinedChain({
  clock:()=>1000000,telegramIngress:createV3TelegramIngressFixture({allowedUserId:55}),
  policy:{entities:{}},configPath:"/unused",
  readTool:async()=>{throw Error("no other reads");},
  wholeHouseOff:{enabled:true,reviewedMembers:members,readGroup:async()=>({
   entity_id:"light.ves_svet",platform:"group",attributes:{entity_id:members},
  })},
  simulateWrite:async(name,args)=>{
   assert.equal(name,"ha_call_service");
   assert.deepEqual(args,action.args);writes++;return {success:true};
  },
 });
 assert.equal(chain.issue({ctx,action}).status,"denied");
 assert.equal(chain.issueFromTransport({ctx,action:{...action,args:{...action.args,entity_id:"light.ves_svet_2"}}}).status,"denied");
 const issued=chain.issueFromTransport({ctx,action});
 assert.equal(issued.status,"pending");
 assert.equal((await chain.confirm({userId:999,chatId:66,token:issued.token})).status,"missing");
 assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,"simulated");
 assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,"missing");
 assert.equal(writes,1);
});
test("missing group approval and changes in membership fail closed",async()=>{
 for(const enabled of [false,true]){
  let writes=0;
  const chain=createIsolatedV3JoinedChain({
   clock:()=>1000000,telegramIngress:createV3TelegramIngressFixture({allowedUserId:55}),
   policy:{entities:{}},configPath:"/unused",readTool:async()=>{},
   wholeHouseOff:{enabled,reviewedMembers:members,readGroup:async()=>({
    entity_id:"light.ves_svet",platform:"group",
    attributes:{entity_id:[...members.slice(1),"light.unapproved"]},
   })},simulateWrite:async()=>writes++,
  });
  const pending=chain.issueFromTransport({ctx,action});
  if(!enabled)assert.equal(pending.status,"denied");
  else assert.equal((await chain.confirm({...pending.actor,token:pending.token})).status,"denied");
  assert.equal(writes,0);
 }
});


test("concurrent confirmations and cancellation during membership lookup never replay",async()=>{
 let writes=0,resolveRead;
 const readWait=new Promise(resolve=>{resolveRead=resolve;});
 const chain=createIsolatedV3JoinedChain({
  clock:()=>1000000,telegramIngress:createV3TelegramIngressFixture({allowedUserId:55}),
  policy:{entities:{}},configPath:"/unused",readTool:async()=>{},
  wholeHouseOff:{enabled:true,reviewedMembers:members,readGroup:async()=>readWait},
  simulateWrite:async()=>{writes++;return {success:true};},
 });
 const issued=chain.issueFromTransport({ctx,action});
 const first=chain.confirm({...issued.actor,token:issued.token});
 assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,"missing");
 assert.equal(chain.cancel(issued.actor),true);
 resolveRead({entity_id:"light.ves_svet",platform:"group",attributes:{entity_id:members}});
 assert.equal((await first).status,"missing");
 assert.equal(writes,0);
});
test("nonaccepted mock write is a failure, never reported as executed",async()=>{
 const chain=createIsolatedV3JoinedChain({
  clock:()=>1000000,telegramIngress:createV3TelegramIngressFixture({allowedUserId:55}),
  policy:{entities:{}},configPath:"/unused",readTool:async()=>{},
  wholeHouseOff:{enabled:true,reviewedMembers:members,readGroup:async()=>({
   entity_id:"light.ves_svet",platform:"group",attributes:{entity_id:members},
  })},
  simulateWrite:async()=>({success:false,error:"rejected"}),
 });
 const issued=chain.issueFromTransport({ctx,action});
 assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,"failed");
 assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,"missing");
});
