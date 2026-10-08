import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { verifyScenePlan } from "../src/scenes/live-plan.mjs";
const area="room";
const scene=(ids)=>({area_id:area,entities:ids.map(entity_id=>({entity_id,state:"on"}))});
async function fixture(fn){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"scene-live-"));
 const configPath=path.join(dir,"reviewed.json");
 await fs.writeFile(configPath,JSON.stringify({version:1,areas:[{area_id:area,area_name:"Комната",light_ids:["light.room"],excluded_light_ids:["light.status"],switch_light_ids:[]}]}));
 const calls=[];
 const callTool=async(name,args)=>{
  calls.push(name);
  if(name==="ha_list_floors_areas") return {structuredContent:{success:true,floors:[{areas:[{area_id:area,name:"Комната"}]}],unassigned_areas:[]}};
  if(name==="ha_search") return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==="light"?2:0,entities:args.domain_filter==="light"?[{entity_id:"light.room",domain:"light",area:"Комната"},{entity_id:"light.status",domain:"light",area:"Комната"}]:[]}};
  if(name==="ha_get_state") return {structuredContent:{data:{entity_id:args.entity_id,state:"off"}}};
  throw Error("service calls forbidden");
 };
 try{await fn({configPath,callTool,calls});}finally{await fs.rm(dir,{recursive:true,force:true});}
}
test("trusted read-only plan returns exact verified lighting actions",async()=>{
 await fixture(async x=>{
  const result=await verifyScenePlan({scene:scene(["light.room"]),areaQuery:"Комната",...x});
  assert.equal(result.ok,true);
  assert.equal(result.status,"verified_read_only_plan_not_authorized");
  assert.deepEqual(result.actions.map(a=>a.args.entity_id),["light.room"]);
  assert.equal(x.calls.includes("ha_call_service"),false);
 });
});
test("excluded light and other domains fail with zero executable actions",async()=>{
 await fixture(async x=>{
  for(const s of [scene(["light.status"]),scene(["light.room","light.status"]),scene(["switch.room"])]){
   const result=await verifyScenePlan({scene:s,areaQuery:"Комната",...x});
   assert.equal(result.ok,false);
   assert.deepEqual(result.actions,[]);
  }
  assert.equal(x.calls.includes("ha_call_service"),false);
 });
});
test("unreviewed mapping and mismatched area fail closed",async()=>{
 await fixture(async x=>{
  const missing=await verifyScenePlan({scene:scene(["light.room"]),areaQuery:"Комната",configPath:"/nonexistent/reviewed.json",callTool:x.callTool});
  assert.equal(missing.ok,false);
  const wrong=await verifyScenePlan({scene:scene(["light.room"]),areaQuery:"Другая",...x});
  assert.equal(wrong.ok,false);
  assert.deepEqual(wrong.actions,[]);
 });
});

test("HA-MCP inventory and state faults fail closed without any service calls",async()=>{
 await fixture(async x=>{
  const baseline=x.callTool;
  const faults=[
   {label:"partial inventory",change:(name,args,result)=>name==="ha_search"&&args.domain_filter==="light"?{...result,structuredContent:{...result.structuredContent,partial:true}}:result},
   {label:"pagination",change:(name,args,result)=>name==="ha_search"&&args.domain_filter==="light"?{...result,structuredContent:{...result.structuredContent,entity_has_more:true}}:result},
   {label:"wrong total",change:(name,args,result)=>name==="ha_search"&&args.domain_filter==="light"?{...result,structuredContent:{...result.structuredContent,entity_total_matches:3}}:result},
   {label:"cross-area",change:(name,args,result)=>name==="ha_search"&&args.domain_filter==="light"?{...result,structuredContent:{...result.structuredContent,entities:[{entity_id:"light.room",domain:"light",area:"Other"},{entity_id:"light.status",domain:"light",area:"Комната"}]}}:result},
   {label:"unclassified light",change:(name,args,result)=>name==="ha_search"&&args.domain_filter==="light"?{...result,structuredContent:{...result.structuredContent,entities:[{entity_id:"light.room",domain:"light",area:"Комната"},{entity_id:"light.unexpected",domain:"light",area:"Комната"}]}}:result},
   {label:"unavailable state",change:(name,args,result)=>name==="ha_get_state"?{structuredContent:{data:{entity_id:args.entity_id,state:"unavailable"}}}:result},
   {label:"wrong state entity",change:(name,args,result)=>name==="ha_get_state"?{structuredContent:{data:{entity_id:"light.other",state:"off"}}}:result},
   {label:"MCP exception",change:(name)=>{if(name==="ha_search")throw Error("MCP read failed");}},
  ];
  for(const fault of faults){
   const callTool=async(name,args)=>{
    const response=await baseline(name,args);
    return fault.change(name,args,response);
   };
   const result=await verifyScenePlan({scene:scene(["light.room"]),areaQuery:"Комната",configPath:x.configPath,callTool});
   assert.equal(result.ok,false,fault.label);
   assert.deepEqual(result.actions,[],fault.label);
  }
  assert.equal(x.calls.includes("ha_call_service"),false);
 });
});
