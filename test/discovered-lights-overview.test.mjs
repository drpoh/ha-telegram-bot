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

test('MCP search never blocks indefinitely and late on-state is not trusted',async()=>{
 let release, calls=0;
 const pending=new Promise(resolve=>{release=resolve;});
 const start=Date.now();
 const result=await summarizeDiscoveredLights({timeoutMs:25,readTool:async()=>{calls++;return pending;}});
 assert.equal(result.status,'unavailable');assert.equal(result.authorization,false);
 assert.equal(result.actualWrite,false);assert.equal(calls,1);
 assert.ok(Date.now()-start<1500);
 release(snap([e('late','on')]));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(result.status,'unavailable');
});
test('MCP search timeout budget is validated before any request',async()=>{
 for(const timeoutMs of [0,-1,30001,1.5,NaN]){
  let calls=0;
  const result=await summarizeDiscoveredLights({timeoutMs,readTool:async()=>{calls++;return snap();}});
  assert.equal(result.status,'unavailable');assert.equal(calls,0);
 }
});

test('deadline emits abort signal to cooperating read transport',async()=>{
 let signal, calls=0;
 const result=await summarizeDiscoveredLights({timeoutMs:25,readTool:(_name,_args,options)=>{
  calls++;signal=options.signal;
  return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
 }});
 assert.equal(calls,1);assert.equal(signal.aborted,true);
 assert.equal(result.status,'unavailable');assert.equal(result.authorization,false);assert.equal(result.actualWrite,false);
});
test('successful read does not abort transport after timer cleanup',async()=>{
 let signal;
 const result=await summarizeDiscoveredLights({timeoutMs:25,readTool:async(_name,_args,options)=>{signal=options.signal;return snap([e('a','on')]);}});
 assert.equal(result.status,'complete');assert.equal(signal.aborted,false);
 await new Promise(resolve=>setTimeout(resolve,45));
 assert.equal(signal.aborted,false);
});
test('ignored cancellation yields denial, not a retried search',async()=>{
 let resolveRead,signal,calls=0;
 const eventual=new Promise(resolve=>{resolveRead=resolve;});
 const result=await summarizeDiscoveredLights({timeoutMs:25,readTool:async(_name,_args,options)=>{signal=options.signal;calls++;return eventual;}});
 assert.equal(result.status,'unavailable');assert.equal(signal.aborted,true);assert.equal(calls,1);
 resolveRead(snap([e('a','on')]));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(result.status,'unavailable');assert.equal(calls,1);
});

test('large light inventory stays concise while full counts and unknowns remain accurate',async()=>{
 const entities=Array.from({length:120},(_,i)=>e('long_entity_name_'+String(i).padStart(3,'0'),'on'));
 entities.push(e('offline','unavailable'));
 const result=await summarizeDiscoveredLights({readTool:async()=>snap(entities)});
 assert.equal(result.status,'partial');
 assert.equal(result.on.length,120);
 assert.equal(result.unknown.length,1);
 assert.match(result.text,/включено 120/);
 assert.match(result.text,/ещё 100 \(список сокращён\)/);
 assert.ok(result.text.length<1500);
 assert.equal(result.authorization,false);
 assert.equal(result.actualWrite,false);
});
