import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createIsolatedV3JoinedChain} from "../src/decision/v3-isolated-joined-chain.mjs";
import {createV3TelegramJoinedAdapter} from "../src/decision/v3-telegram-joined-adapter.mjs";
import {normalizeLightingRegistry,verifyLightingRegistryDigest} from "../src/decision/v3-registry-drift-check.mjs";
const now=1000000;
const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
const ctx=()=>({update:{update_id:12},from:{id:55},chat:{id:55,type:"private"},message:{message_id:20,from:{id:55},chat:{id:55},date:1000,text:"Включи весь свет в Комната"}});
const registry=()=>({entities:[{entity_id:"light.ves_svet",platform:"group",area_id:"dom"},{entity_id:"light.fixture",platform:"mqtt",device_id:"dev"}],devices:[{id:"dev",area_id:"room"}],areas:[{id:"dom"},{id:"room"}],groupMembers:["light.fixture"]});
test("joined Telegram -> scope -> registry drift guard -> one-shot mock action",async()=>{
 const root=mkdtempSync(join(tmpdir(),"registry-joined-"));
 try{
 const file=join(root,"reviewed.json");
 writeFileSync(file,JSON.stringify({version:1,areas:[{area_id:"room",area_name:"Комната",light_ids:["light.fixture"],excluded_light_ids:[],switch_light_ids:[]}]}));
 let state="off",writes=0,live=registry(),hold=null;
 const pin=normalizeLightingRegistry(live).sha256;
 const readTool=async(name,args)=>{
  if(name==="ha_list_floors_areas")return {structuredContent:{success:true,floors:[{areas:[{area_id:"room",name:"Комната"}]}],unassigned_areas:[]}};
  if(name==="ha_search")return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==="light"?1:0,entities:args.domain_filter==="light"?[{entity_id:"light.fixture",domain:"light",area:"Комната"}]:[]}};
  if(name==="ha_get_state")return {structuredContent:{data:{entity_id:args.entity_id,state}}};
  throw Error("unexpected read");
 };
 const chain=createIsolatedV3JoinedChain({
  telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>now}),clock:()=>now,
  policy:{entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}},configPath:file,readTool,
  simulateWrite:async()=>{writes++;state="on";return {structuredContent:{success:true}};},
  verifyRegistryAtDispatch:async()=>{if(hold)await hold;return verifyLightingRegistryDigest(normalizeLightingRegistry(live),pin);}
 });
 const first=chain.issueFromTransport({ctx:ctx(),action});assert.equal(first.status,"pending");
 live={...live,devices:[{id:"dev",area_id:"dom"}]};
 assert.equal((await chain.confirm({...first.actor,token:first.token})).reason,"registry_changed_or_unverified");
 assert.equal(writes,0);
 live=registry();let release;hold=new Promise(r=>{release=r;});
 const inFlight=chain.confirm({...first.actor,token:first.token});
 await new Promise(r=>setTimeout(r,20));
 live={...live,groupMembers:["light.ves_svet"]};release();
 assert.equal((await inFlight).status,"denied");assert.equal(writes,0);
 hold=null;live=registry();
 assert.equal((await chain.confirm({...first.actor,token:first.token})).status,"verified");
 assert.equal(writes,1);
 assert.equal((await chain.confirm({...first.actor,token:first.token})).status,"missing");
 }finally{rmSync(root,{recursive:true,force:true});}
});
