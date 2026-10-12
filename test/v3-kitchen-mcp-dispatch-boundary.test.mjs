import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenMcpDispatchBoundary} from '../src/pilot/kitchen-mcp-dispatch-boundary.mjs';
const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.tambur_svet_l1'}};
test('default deny does not invoke injected MCP writer',async()=>{
 let calls=0;const b=createKitchenMcpDispatchBoundary({callTool:async()=>{calls++}});
 assert.equal((await b.dispatch({action,})).status,'denied');
 assert.equal(calls,0);
});
test('release test fixture needs admission and exact target before any calls',async()=>{
 let calls=0;const b=createKitchenMcpDispatchBoundary({releaseEnabled:true,verifyAdmission:async()=>({valid:false}),callTool:async()=>{calls++}});
 assert.equal((await b.dispatch({action})).status,'denied');
 assert.equal((await b.dispatch({action:{...action,args:{...action.args,entity_id:'light.svet_kukhni'}},})).status,'denied');
 assert.equal(calls,0);
});

test('forged admission field cannot bypass missing local verifier',async()=>{
 let calls=0;const b=createKitchenMcpDispatchBoundary({releaseEnabled:true,callTool:async()=>{calls++}});
 const r=await b.dispatch({action,admission:{authorized:true,trustedSource:'local_operator_gate'}});
 assert.equal(r.reason,'missing_trusted_admission');assert.equal(calls,0);
});
