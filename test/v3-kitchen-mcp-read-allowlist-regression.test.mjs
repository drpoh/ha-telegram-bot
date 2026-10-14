import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenMcpClient} from '../src/pilot/kitchen-mcp-client.mjs';
import {REVIEWED_KITCHEN_LIGHTS} from '../src/home/kitchen-light-readonly-status.mjs';

// This is an offline boundary test: successful scope validation proceeds to read a
// deliberately missing local endpoint config, never a live MCP connection.
test('kitchen MCP client allows exactly reviewed kitchen state reads but no new writes',async()=>{
 const read=createKitchenMcpClient({endpointFile:'/nonexistent-v3-scope-test/mcp-url'});
 assert.equal(REVIEWED_KITCHEN_LIGHTS.length,4);
 for(const {id} of REVIEWED_KITCHEN_LIGHTS){
  await assert.rejects(read('ha_get_state',{entity_id:id}),err=>err?.code==='ENOENT');
  await assert.rejects(read('ha_call_service',{domain:'light',service:'turn_on',entity_id:id}),/scope_denied/);
 }
 await assert.rejects(read('ha_get_state',{entity_id:'light.unknown_kitchen'}),/scope_denied/);
 await assert.rejects(read('ha_get_state',{entity_id:REVIEWED_KITCHEN_LIGHTS[0].id,extra:true}),/scope_denied/);
});
