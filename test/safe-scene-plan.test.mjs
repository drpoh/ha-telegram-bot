import test from 'node:test';
import assert from 'node:assert/strict';
import { planAiSceneOperation as plan } from '../src/scenes/safe-scene-plan.mjs';
const area={area_id:'living',name:'Гостиная',requestedArea:'Гостиная'};
const args={name:'Вечер',area:'Гостиная'};
const scene={area_id:'living',entities:[{entity_id:'light.a'}]};
test('safe scene play only plans; reads discovery without actions',async()=>{
 const calls=[];
 const result=await plan({toolName:'ai_scene_run',source:'user_explicit',args,area,scene,callTool:async(name,query)=>{
  calls.push(name);
  return {structuredContent:{success:true,entities:query.domain_filter==='light'?[{entity_id:'light.a',area_id:'living'}]:[],entity_has_more:false}};
 }});
 assert.equal(result.allowed,true);
 assert.deepEqual([...new Set(calls)],['ha_search']);
 assert.equal(calls.length,4);
});
test('reject unknown and wrong-room scene before HA reads',async()=>{
 let called=false;
 const result=await plan({toolName:'ai_scene_run',source:'user_explicit',args,area,scene:{...scene,area_id:'other'},callTool:async()=>{called=true;}});
 assert.equal(result.allowed,false);
 assert.equal(called,false);
});
test('fail closed on missing or incomplete discovery',async()=>{
 const result=await plan({toolName:'ai_scene_run',source:'user_explicit',args,area,scene,callTool:async()=>({structuredContent:{entities:[],entity_has_more:true}})});
 assert.equal(result.allowed,false);
});
