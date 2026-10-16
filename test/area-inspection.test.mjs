import test from "node:test";
import assert from "node:assert/strict";
import { inspectAreaDevices } from "../src/home/area-inspection.mjs";

const floors = { structuredContent: { success: true, floors: [{ areas: [{area_id:"k",name:"Кухня",aliases:["Kitchen"]}]}],unassigned_areas:[] } };
test("room inspection is read-only and complete only for device registry", async () => {
  const calls=[];
  const result=await inspectAreaDevices("кухня",async(name,args)=>{
    calls.push(name);
    if(name==="ha_list_floors_areas")return floors;
    return {structuredContent:{success:true,devices:[{area_id:"k",name:"Датчик"}],offset:0,count:1,total_count:1,has_more:false,next_offset:null}};
  });
  assert.equal(result.status,"complete_device_registry");
  assert.equal(result.devices[0].name,"Датчик");
  assert.deepEqual(calls,["ha_list_floors_areas","ha_get_device"]);
});
test("unknown room cannot query device list",async()=>{
 let calls=0;
 const result=await inspectAreaDevices("Гостиная",async()=>{calls++;return floors;});
 assert.equal(result.status,"area_not_found");
 assert.equal(calls,1);
});
test("incomplete pagination never reports complete",async()=>{
 const result=await inspectAreaDevices("Kitchen",async(name)=>name==="ha_list_floors_areas"?floors:{isError:true});
 assert.equal(result.status,"incomplete");
});

test("inflected Russian room names resolve exact verified HA area", async () => {
 const calls=[];
 const inventory=await inspectAreaDevices("кухне",async(name,args)=>{
  calls.push(name);
  return name==="ha_list_floors_areas"
   ? {structuredContent:{success:true,floors:[{areas:[{area_id:"k",name:"Кухня"}]}],unassigned_areas:[]}}
   : {structuredContent:{success:true,offset:0,count:0,total_count:0,has_more:false,next_offset:null,devices:[]}};
 });
 assert.equal(inventory.status,"complete_device_registry");
 assert.deepEqual(calls,["ha_list_floors_areas","ha_get_device"]);
});
