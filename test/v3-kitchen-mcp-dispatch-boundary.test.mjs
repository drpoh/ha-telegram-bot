import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenMcpDispatchBoundary} from '../src/pilot/kitchen-mcp-dispatch-boundary.mjs';
const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.led_kukhnia'}};
test('default deny does not invoke injected MCP writer',async()=>{
 let calls=0;const b=createKitchenMcpDispatchBoundary({callTool:async()=>{calls++}});
 assert.equal((await b.dispatch({action,admission:{authorized:true,trustedSource:'local_operator_gate'}})).status,'denied');
 assert.equal(calls,0);
});
test('release test fixture needs admission and exact target before any calls',async()=>{
 let calls=0;const b=createKitchenMcpDispatchBoundary({releaseEnabled:true,callTool:async()=>{calls++}});
 assert.equal((await b.dispatch({action})).status,'denied');
 assert.equal((await b.dispatch({action:{...action,args:{...action.args,entity_id:'light.svet_kukhni'}},admission:{authorized:true,trustedSource:'local_operator_gate'}})).status,'denied');
 assert.equal(calls,0);
});
