import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenMcpDispatchBoundary} from '../src/pilot/kitchen-mcp-dispatch-boundary.mjs';
const action={name:'ha_call_service',args:{domain:'light',entity_id:'light.led_kukhnia',service:'turn_on'}};
const state=s=>({structuredContent:{data:{entity_id:'light.led_kukhnia',state:s}}});
test('delayed Zigbee readback verifies with one write only',async()=>{
 let reads=0,writes=0;
 const b=createKitchenMcpDispatchBoundary({releaseEnabled:true,verifyAdmission:async()=>({valid:true}),callTool:async name=>{
  if(name==='ha_get_state')return state(++reads>=4?'on':'off');
  writes++;return {structuredContent:{success:true}};
 }});
 assert.deepEqual(await b.dispatch({action}),{status:'verified',reason:'confirmed'});
 assert.equal(writes,1);assert.equal(reads,4);
});
