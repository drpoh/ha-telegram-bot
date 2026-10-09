import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenMcpDispatchBoundary} from '../src/pilot/kitchen-mcp-dispatch-boundary.mjs';
import {createKitchenDryrunConsent} from '../src/pilot/kitchen-dryrun-consent.mjs';
const action={name:'ha_call_service',args:{domain:'light',service:'turn_off',entity_id:'light.led_kukhnia'}};
const actor={userId:770,chatId:770};
const state=(value='on')=>({structuredContent:{data:{entity_id:'light.led_kukhnia',state:value}}});
const authorized=()=>({valid:true});
test('MCP unavailable at preflight: no physical write and consumed confirmation cannot replay',async()=>{
 let writes=0,reads=0;
 const boundary=createKitchenMcpDispatchBoundary({releaseEnabled:true,verifyAdmission:authorized,callTool:async name=>{if(name==='ha_get_state'){reads++;throw Error('MCP disconnected');}writes++;}});
 const consent=createKitchenDryrunConsent({dispatch:({action})=>boundary.dispatch({action})});
 assert.equal(consent.request(actor,'Выключи свет на кухне').status,'pending');
 assert.deepEqual(await consent.confirm(actor),{status:'failed',reason:'mcp_call_failed'});
 assert.equal((await consent.confirm(actor)).status,'missing');
 assert.equal(writes,0);assert.equal(reads,1);
});
test('MCP write failure after preflight never retries write on duplicate confirmation',async()=>{
 let writes=0;
 const boundary=createKitchenMcpDispatchBoundary({releaseEnabled:true,verifyAdmission:authorized,callTool:async name=>{if(name==='ha_get_state')return state();writes++;throw Error('disconnect during write');}});
 const consent=createKitchenDryrunConsent({dispatch:({action})=>boundary.dispatch({action})});
 assert.equal(consent.request(actor,'Выключи свет на кухне').status,'pending');
 assert.equal((await consent.confirm(actor)).status,'failed');
 assert.equal((await consent.confirm(actor)).status,'missing');assert.equal(writes,1);
});
test('MCP readback failure leaves result unverified, never issues second write',async()=>{
 let reads=0,writes=0;
 const boundary=createKitchenMcpDispatchBoundary({releaseEnabled:true,verifyAdmission:authorized,callTool:async name=>{
  if(name==='ha_get_state'){reads++;if(reads>1)throw Error('readback timeout');return state();}
  writes++;return {structuredContent:{success:true}};
 }});
 const consent=createKitchenDryrunConsent({dispatch:({action})=>boundary.dispatch({action})});
 assert.equal(consent.request(actor,'Выключи свет на кухне').status,'pending');
 const r=await consent.confirm(actor);assert.notEqual(r.status,'verified');
 assert.equal((await consent.confirm(actor)).status,'missing');assert.equal(writes,1);assert.equal(reads,2);
});
test('unavailable admission checker denies before MCP client',async()=>{
 let calls=0;
 const boundary=createKitchenMcpDispatchBoundary({releaseEnabled:true,verifyAdmission:async()=>{throw Error('registry unavailable')},callTool:async()=>{calls++;}});
 assert.deepEqual(await boundary.dispatch({action}),{status:'denied',reason:'approval_check_failed'});assert.equal(calls,0);
});
