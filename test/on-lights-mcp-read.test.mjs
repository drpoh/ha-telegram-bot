import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeConfiguredLights} from '../src/home/on-lights-mcp-read.mjs';
const devices={a:{domain:'light',entity_id:'light.a'},b:{domain:'light',entity_id:'light.b'},sensor:{domain:'sensor',entity_id:'sensor.other'}};
test('queries only explicitly configured lights through HA read tool',async()=>{
 const calls=[];const r=await summarizeConfiguredLights({devices,readTool:async (name,args)=>{calls.push([name,args.entity_id]);return {structuredContent:{data:{entity_id:args.entity_id,state:args.entity_id==='light.a'?'on':'off'}}};}});
 assert.equal(r.status,'complete');assert.deepEqual(r.on,['light.a']);assert.deepEqual(calls,[['ha_get_state','light.a'],['ha_get_state','light.b']]);assert.match(r.text,/только светильники из списка/);
});
test('missing identity, errors and unavailable telemetry never imply all off',async()=>{
 for(const readTool of [async()=>({isError:true}),async()=>({structuredContent:{data:{entity_id:'light.other',state:'off'}}}),async()=>{throw Error('offline');},async (_,args)=>({structuredContent:{data:{entity_id:args.entity_id,state:'unavailable'}}})]){
  const r=await summarizeConfiguredLights({devices,readTool});assert.equal(r.status,'unavailable');assert.doesNotMatch(r.text,/Все .* выключены/);
 }
});
test('empty and overbroad device lists refuse before any MCP read',async()=>{
 let calls=0;const readTool=async()=>{calls++;};
 assert.equal((await summarizeConfiguredLights({devices:{},readTool})).status,'unavailable');
 const broad=Object.fromEntries(Array.from({length:21},(_,i)=>[String(i),{domain:'light',entity_id:'light.x'+i}]));
 assert.equal((await summarizeConfiguredLights({devices:broad,readTool})).status,'unavailable');assert.equal(calls,0);
});

test('plain MCP text JSON with matching identity is accepted, malformed data denied',async()=>{
 const ok=await summarizeConfiguredLights({devices,readTool:async (_,args)=>({content:[{type:'text',text:JSON.stringify({entity_id:args.entity_id,state:'on'})}]})});
 assert.equal(ok.status,'complete');assert.deepEqual(ok.on,['light.a','light.b']);
 for(const text of ['not-json',JSON.stringify({entity_id:'light.other',state:'on'})]){
  const result=await summarizeConfiguredLights({devices,readTool:async()=>({content:[{type:'text',text}]})});
  assert.equal(result.status,'unavailable');
 }
});
