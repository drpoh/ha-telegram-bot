import test from "node:test";
import assert from "node:assert/strict";
import {checkV3ToolBoundary,callV3GuardedTool} from "../src/decision/v3-tool-boundary.mjs";
test("v3 denies every unlisted tool and HA configuration mutation",()=>{
 for(const name of ["ha_config_set_automation","ha_config_set_script","ha_config_remove_scene","ha_call_service_extra","ha_restart","ha_config_get_automation"]){
  assert.equal(checkV3ToolBoundary({name,args:{}}).allowed,false,name);
 }
});
test("v3 denies dangerous or widened services and requires independent write authorization",async()=>{
 const cases=[
  {domain:"homeassistant",service:"restart",entity_id:"light.fixture"},
  {domain:"automation",service:"reload",entity_id:"automation.fixture"},
  {domain:"light",service:"toggle",entity_id:"light.fixture"},
  {domain:"light",service:"turn_on",entity_id:["light.fixture"]},
  {domain:"light",service:"turn_on",entity_id:"light.fixture,light.other"},
  {domain:"light",service:"turn_on",entity_id:"light.fixture",extra:true},
 ];
 for(const args of cases)assert.equal(checkV3ToolBoundary({name:"ha_call_service",args}).allowed,false);
 const args={domain:"light",service:"turn_on",entity_id:"light.fixture"};
 let calls=0;
 const callTool=async()=>{calls++;return {success:true};};
 assert.equal((await callV3GuardedTool({name:"ha_call_service",args,callTool})).reason,"authorization_required");
 assert.equal(calls,0);
 assert.deepEqual(await callV3GuardedTool({name:"ha_call_service",args,callTool,authorized:true}),{success:true});
 assert.equal(calls,1);
});
test("read-only allowlisted tools remain available without writes",async()=>{
 let calls=0;
 const result=await callV3GuardedTool({name:"ha_get_state",args:{entity_id:"light.fixture"},callTool:async()=>{calls++;return {data:{state:"off"}};}});
 assert.equal(result.data.state,"off");assert.equal(calls,1);
});
