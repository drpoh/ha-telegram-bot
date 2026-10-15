import test from 'node:test';
import assert from 'node:assert/strict';
import { callAiSceneTool } from '../src/scenes/tools.mjs';
for (const name of ['ai_scene_capture','ai_scene_delete','ai_scene_run']) {
 test(name+' rejects missing trusted context without touching HA',async()=>{
  const response=await callAiSceneTool(name,{name:'Вечер',area:'Гостиная'});
  assert.equal(response.blocked,true);
  assert.equal(response.outcome,'scene_operation_not_authorized');
 });
 test(name+' rejects ambiguous user text before resolving area',async()=>{
  const response=await callAiSceneTool(name,{name:'Вечер',area:'Гостиная'}, {source:'user_explicit',userText:'сделай это'});
  assert.equal(response.blocked,true);
  assert.equal(response.outcome,'scene_identity_unconfirmed');
 });
}
