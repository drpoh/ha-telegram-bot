import test from "node:test";
import assert from "node:assert/strict";
import {createIsolatedV3JoinedChain} from "../src/decision/v3-isolated-joined-chain.mjs";

const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
const request={source:"telegram",sourceId:"66",actorId:55,authenticated:true,
 text:"Включи весь свет в Комната",issuedAt:1000,action};
function setup(){
 let writes=0,reads=0;
 const chain=createIsolatedV3JoinedChain({
  clock:()=>1000,policy:{entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}},
  configPath:"/missing_fixture",
  readTool:async()=>{reads++;throw Error("no live evidence");},
  simulateWrite:async()=>{writes++;return {structuredContent:{success:true}};},
 });
 return {chain,counts:()=>({writes,reads})};
}
test("joined ingress denies unauthenticated, spoofed, stale and dangerous commands",async()=>{
 const {chain,counts}=setup();
 for(const v of [
  {...request,authenticated:false},
  {...request,source:"assist",authenticated:false,actorId:null},
  {...request,sourceId:"room",actorId:55},
  {...request,issuedAt:-100000},
  {...request,action:{name:"ha_call_service",args:{domain:"homeassistant",service:"restart"}}},
  {...request,text:"Перезапусти Home Assistant"},
  {...request,action:{name:"ha_call_service",args:{domain:"light",service:"turn_off",entity_id:"light.fixture"}}},
 ])assert.equal(chain.issue(v).status,"denied");
 assert.deepEqual(counts(),{writes:0,reads:0});
});
test("joined token requires matching actor, valid evidence, then blocks writes",async()=>{
 const {chain,counts}=setup();
 const issued=chain.issue(request);
 assert.equal(issued.status,"pending");
 assert.equal((await chain.confirm({userId:56,chatId:66,token:issued.token})).status,"missing");
 assert.equal((await chain.confirm({userId:55,chatId:66,token:issued.token})).status,"denied");
 assert.deepEqual(counts(),{writes:0,reads:1});
 assert.equal(chain.cancel(issued.actor),true);
 assert.equal((await chain.confirm({...issued.actor,token:issued.token})).status,"missing");
});

test("joined chain verifies one explicitly scoped mock action and denies replay",async()=>{
 const {mkdtempSync,writeFileSync,rmSync}=await import("node:fs");
 const {tmpdir}=await import("node:os");
 const {join}=await import("node:path");
 const dir=mkdtempSync(join(tmpdir(),"v3-joined-"));
 try{
  const configPath=join(dir,"reviewed.json");
  writeFileSync(configPath,JSON.stringify({version:1,areas:[{
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
   throw Error("unexpected_tool");
  };
  const chain=createIsolatedV3JoinedChain({
   clock:()=>1000,configPath,readTool,
   policy:{entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}},
   simulateWrite:async(name,args)=>{
    assert.equal(name,"ha_call_service");
    assert.deepEqual(args,action.args);
    writes++;state="on";return {structuredContent:{success:true}};
   },
  });
  const pending=chain.issue(request);
  assert.equal(pending.status,"pending");
  assert.equal((await chain.confirm({...pending.actor,token:pending.token})).status,"verified");
  assert.equal(writes,1);
  assert.equal((await chain.confirm({...pending.actor,token:pending.token})).status,"missing");
  assert.equal(writes,1);
  const replaced=chain.issue(request);
  const latest=chain.issue(request);
  assert.equal((await chain.confirm({...replaced.actor,token:replaced.token})).status,"missing");
  chain.cancel(latest.actor);
  assert.equal((await chain.confirm({...latest.actor,token:latest.token})).status,"missing");
  assert.equal(writes,1);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
