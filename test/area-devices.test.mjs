import test from "node:test";
import assert from "node:assert/strict";
import { listAreaDevices } from "../src/home/area-devices.mjs";
test("paginates exact room devices", async () => {
  const pages = [{success:true,offset:0,count:1,total_count:2,has_more:true,next_offset:1,devices:[{area_id:"kitchen",device_id:"a"}]},{success:true,offset:1,count:1,total_count:2,has_more:false,next_offset:null,devices:[{area_id:"kitchen",device_id:"b"}]}];
  const calls=[];
  const result=await listAreaDevices("kitchen",async(name,args)=>{ calls.push([name,args.offset]); return {structuredContent:pages[args.offset]};},{pageSize:1});
  assert.equal(result.complete,true);
  assert.equal(result.devices.length,2);
  assert.deepEqual(calls,[["ha_get_device",0],["ha_get_device",1]]);
});
test("rejects wrong area and pagination mismatch", async () => {
  const wrong=await listAreaDevices("kitchen",async()=>({structuredContent:{success:true,offset:0,count:1,total_count:1,has_more:false,devices:[{area_id:"hall"}]}}));
  assert.equal(wrong.complete,false);
  assert.equal(wrong.reason,"area_mismatch");
});
test("fails closed on empty or unverified pages", async () => {
  const incomplete=await listAreaDevices("kitchen",async()=>({isError:true}));
  assert.equal(incomplete.complete,false);
});
