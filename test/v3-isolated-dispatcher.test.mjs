import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {clearPendingConfirmations,createPendingConfirmation} from "../src/decision/pending-confirmation.mjs";
import {createIsolatedV3ConfirmationDispatcher} from "../src/decision/v3-isolated-dispatcher.mjs";

test("mock-only v3 dispatcher denies model-supplied override and executes once",async()=>{
 const root=mkdtempSync(join(tmpdir(),"v3-isolated-dispatch-"));
 try{
  const configPath=join(root,"reviewed.json");
  writeFileSync(configPath,JSON.stringify({version:1,areas:[{area_id:"room",area_name:"Комната",light_ids:["light.fixture"],excluded_light_ids:[],switch_light_ids:[]}]}));
  let writes=0;
  let state="off";
  const discoverTool=async(name,args)=>{
   if(name==="ha_list_floors_areas")return {structuredContent:{success:true,floors:[{areas:[{area_id:"room",name:"Комната"}]}],unassigned_areas:[]}};
   if(name==="ha_search")return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==="light"?1:0,entities:args.domain_filter==="light"?[{entity_id:"light.fixture",domain:"light",area:"Комната"}]:[]}};
   if(name==="ha_get_state")return {structuredContent:{data:{entity_id:args.entity_id,state}}};
   throw Error("unexpected tool");
  };
  const simulatedService=async()=>{writes++;state="on";return {structuredContent:{success:true}};};
  const dispatch=createIsolatedV3ConfirmationDispatcher({
   trustedPolicy:{entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}},
   reviewedConfigPath:configPath,originalUserText:"Включи весь свет в Комната",areaQuery:"Комната",
   discoverTool,simulatedService,
  });
  const actor={userId:8001,chatId:8002};
  clearPendingConfirmations();
  createPendingConfirmation({...actor,action:{name:"ha_call_service",args:{domain:"homeassistant",service:"restart",entity_id:"light.fixture"}}});
  assert.equal((await dispatch(actor)).status,"authorization_denied");
  assert.equal(writes,0);
  clearPendingConfirmations();
  createPendingConfirmation({...actor,action:{name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}}});
  assert.equal((await dispatch({...actor,authorized:true,allowedEntityIds:["light.other"]})).status,"executed");
  assert.equal((await dispatch(actor)).status,"missing");
  assert.equal(writes,1);
 }finally{clearPendingConfirmations();rmSync(root,{recursive:true,force:true});}
});
