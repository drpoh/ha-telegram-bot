import test from 'node:test';import assert from 'node:assert/strict';
import {summarizeDiscoveredLights} from '../src/home/discovered-lights-overview.mjs';
const e=(id,state)=>({entity_id:'light.'+id,domain:'light',state});
const snap=(entities=[e('a','on'),e('b','off'),e('c','unavailable')])=>({structuredContent:{success:true,partial:false,entity_has_more:false,entity_next_offset:null,entity_total_matches:entities.length,entities}});
test('one complete search reports on, off and unknown separately',async()=>{let calls=[];const r=await summarizeDiscoveredLights({readTool:async(name,args)=>{calls.push([name,args]);return snap();}});assert.equal(r.status,'partial');assert.deepEqual(r.on,['light.a']);assert.deepEqual(r.unknown,['light.c']);assert.match(r.text,/Неизвестные не считаются выключенными/);assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);assert.deepEqual(calls[0][0],'ha_search');assert.equal(calls.length,1);});
test('no unknown states yields complete summary',async()=>{const r=await summarizeDiscoveredLights({readTool:async()=>snap([e('a','off')])});assert.equal(r.status,'complete');assert.equal(r.on.length,0);});
test('partial pages, duplicates, invalid members or errors fail closed',async()=>{for(const response of [{...snap(),structuredContent:{...snap().structuredContent,entity_has_more:true}},snap([e('a','on'),e('a','off')]),snap([{entity_id:'switch.a',domain:'switch',state:'on'}]),{isError:true}]){const r=await summarizeDiscoveredLights({readTool:async()=>response});assert.equal(r.status,'unavailable');assert.equal(r.actualWrite,false);}});
test('strict search response rejects missing coverage proof and shape errors',async()=>{
 for(const change of [{entity_total_matches:40},{entity_next_offset:20},{partial:true},{success:false},{entities:null},{entity_has_more:null}]){
  const response={structuredContent:{...snap().structuredContent,...change}};
  const r=await summarizeDiscoveredLights({readTool:async()=>response});
  assert.equal(r.status,'unavailable');assert.equal(r.actualWrite,false);
 }
});
test('empty inventory and wrong member identity are not a clean all-off result',async()=>{
 for(const entities of [[],[e('a','on'),{...e('b','off'),entity_id:'light.a'}],[{...e('x','on'),domain:'switch'}]]){
  const r=await summarizeDiscoveredLights({readTool:async()=>snap(entities)});
  assert.equal(r.status,'unavailable');assert.equal(r.authorization,false);
 }
});
test('bounded discovery never silently truncates excessive light inventory',async()=>{
 let seenArgs;
 const r=await summarizeDiscoveredLights({maxEntities:2,readTool:async(_name,args)=>{seenArgs=args;return snap([e('a','on'),e('b','off'),e('c','on')]);}});
 assert.equal(seenArgs.limit,2);assert.equal(seenArgs.domain_filter,'light');
 assert.equal(r.status,'unavailable');assert.equal(r.actualWrite,false);
});
test('unsupported states are unknown, never inferred off',async()=>{
 const r=await summarizeDiscoveredLights({readTool:async()=>snap([e('a','unavailable'),e('b','unknown'),e('c','idle')])});
 assert.equal(r.status,'partial');assert.equal(r.on.length,0);assert.equal(r.off.length,0);assert.deepEqual(r.unknown,['light.a','light.b','light.c']);
 assert.match(r.text,/Неизвестные не считаются выключенными/);
});
