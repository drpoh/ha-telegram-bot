import test from "node:test";
import assert from "node:assert/strict";
import {createIsolatedV3JoinedChain} from "../src/decision/v3-isolated-joined-chain.mjs";
import {createV3TelegramIngressFixture} from "../src/decision/v3-telegram-ingress-fixture.mjs";

const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
const ctx={from:{id:55},chat:{id:66},message:{from:{id:55},chat:{id:66},date:1000,text:"Включи весь свет в Комната"}};
test("transport fixture authorizes only allowlisted, coherent Telegram update",()=>{
 let writes=0,reads=0;
 const chain=createIsolatedV3JoinedChain({
  telegramIngress:createV3TelegramIngressFixture({allowedUserId:55,clock:()=>1000000}),
  clock:()=>1000000,policy:{},configPath:"/none",
  readTool:async()=>{reads++;throw Error("no evidence");},
  simulateWrite:async()=>{writes++;throw Error("no writes");},
 });
 for(const bad of [
  {...ctx,from:{id:77}},
  {...ctx,message:{...ctx.message,from:{id:77}}},
  {...ctx,message:{...ctx.message,chat:{id:999}}},
  {...ctx,message:{...ctx.message,date:800}},
  {...ctx,message:{...ctx.message,text:"/start"}},
  {...ctx,message:{...ctx.message,text:"Выключи весь свет в Комната"}},
 ])assert.equal(chain.issueFromTransport({ctx:bad,action}).status,"denied");
 assert.equal(chain.issueFromTransport({ctx,action,authenticated:true,actorId:55}).status,"pending");
 assert.equal(chain.issue({ctx,action,authenticated:true}).status,"denied");
 assert.equal(writes,0);
 assert.equal(reads,0);
});


test("trusted Telegram fixture joins token, mock scope, and single-use readback",async()=>{
 const {mkdtempSync,writeFileSync,rmSync}=await import("node:fs");
 const {tmpdir}=await import("node:os");
 const {join}=await import("node:path");
 const root=mkdtempSync(join(tmpdir(),"gateb-telegram-"));
 try{
  const path=join(root,"reviewed.json");
  writeFileSync(path,JSON.stringify({version:1,areas:[{
   area_id:"room",area_name:"Комната",light_ids:["light.fixture"],
   excluded_light_ids:[],switch_light_ids:[],
  }]}));
  let state="off",writes=0;
  const readTool=async(name,args)=>{
   if(name==="ha_list_floors_areas")return {structuredContent:{success:true,floors:[{
    areas:[{area_id:"room",name:"Комната"}]}],unassigned_areas:[]}};
   if(name==="ha_search")return {structuredContent:{success:true,partial:false,
    entity_has_more:false,entity_total_matches:args.domain_filter==="light"?1:0,
    entities:args.domain_filter==="light"?[{entity_id:"light.fixture",domain:"light",area:"Комната"}]:[]}};
   if(name==="ha_get_state")return {structuredContent:{data:{entity_id:args.entity_id,state}}};
   throw Error("unexpected read");
  };
  const chain=createIsolatedV3JoinedChain({
   telegramIngress:createV3TelegramIngressFixture({allowedUserId:55}),
   clock:()=>1000000,policy:{entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}},
   configPath:path,readTool,
   simulateWrite:async(name,args)=>{writes++;state="on";return {structuredContent:{success:true}};},
  });
  const issued=chain.issueFromTransport({ctx,action});
  assert.equal(issued.status,"pending");
  assert.equal((await chain.confirm({userId:77,chatId:66,token:issued.token})).status,"missing");
  assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,"verified");
  assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,"missing");
  assert.equal(writes,1);
 }finally{rmSync(root,{recursive:true,force:true});}
});
