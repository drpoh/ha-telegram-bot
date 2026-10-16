import test from "node:test";
import assert from "node:assert/strict";
import { probeMcp } from "../src/status/mcp-probe.mjs";
const entityId = "sensor.sauna_te_sauna_temperature";
test("disconnected when no MCP client", async () => { assert.equal((await probeMcp()).status,"disconnected"); });
test("read-only HA readback success", async () => {
  let args;
  const result = await probeMcp({client:{callTool:async (...a)=>{args=a;return {structuredContent:{data:{entity_id:entityId,state:"25"}}};}}});
  assert.equal(result.status,"ok");
  assert.equal(args[0].name,"ha_get_state");
  assert.deepEqual(args[0].arguments,{entity_id:entityId});
  assert.equal(args[2].timeout,5000);
});
test("unexpected or failed responses are not healthy", async () => {
  assert.equal((await probeMcp({client:{callTool:async()=>({isError:true})}})).status,"unverified");
  assert.equal((await probeMcp({client:{callTool:async()=>({structuredContent:{data:{entity_id:entityId,state:null}}})}})).status,"unverified");
});
test("timeout and backend errors are reported without secrets", async () => {
  const a=await probeMcp({client:{callTool:async()=>{throw new Error("request timed out");}}});
  assert.deepEqual(a,{status:"error",reason:"timeout"});
});
