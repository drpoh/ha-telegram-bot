import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAiSceneOperation as check } from '../src/scenes/authorization.mjs';

const area={area_id:'living_room',name:'Гостиная',requestedArea:'Гостиная'};
const args={name:'Вечер',area:'Гостиная'};
const scene={area_id:'living_room',entities:[{entity_id:'light.living'}]};
test('local scene list remains read-only',()=>{
 assert.equal(check({toolName:'ai_scene_list',area}).allowed,true);
});
test('capture requires explicit origin and area',()=>{
 assert.equal(check({toolName:'ai_scene_capture',args,area,source:'autonomous'}).allowed,false);
 assert.equal(check({toolName:'ai_scene_capture',args,area,source:'user_explicit'}).allowed,true);
 assert.equal(check({toolName:'ai_scene_capture',args,source:'user_explicit'}).allowed,false);
 assert.equal(check({toolName:'ai_scene_capture',args:{...args,area:'Кухня'},area,source:'user_explicit'}).allowed,false);
});
test('local scene delete rejects cross-room and autonomous requests',()=>{
 assert.equal(check({toolName:'ai_scene_delete',args,area,scene:{...scene,area_id:'kitchen'},source:'user_explicit'}).allowed,false);
 assert.equal(check({toolName:'ai_scene_delete',args,area,scene,source:'autonomous'}).allowed,false);
 assert.equal(check({toolName:'ai_scene_delete',args,area,scene,source:'user_explicit'}).allowed,true);
});
test('playback requires verified entities and safe domain',()=>{
 const normal={toolName:'ai_scene_run',args,area,scene,source:'user_explicit'};
 assert.equal(check(normal).allowed,false);
 assert.equal(check({...normal,verifiedAreaEntityIds:['light.living']}).allowed,true);
 assert.equal(check({...normal,verifiedAreaEntityIds:['light.other']}).allowed,false);
 assert.equal(check({...normal,scene:{...scene,entities:[{entity_id:'lock.front'}]},verifiedAreaEntityIds:['lock.front']}).allowed,false);
});
