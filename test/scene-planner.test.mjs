import test from "node:test";
import assert from "node:assert/strict";
import {planAiScene} from "../src/scenes/planner.mjs";
const area_id="test_area";
const scene=(entities)=>({area_id,entities});
const light={entity_id:"light.test",state:"on",attributes:{brightness:120}};
test("produces inert exact service plan",()=>{
 const result=planAiScene(scene([light,{entity_id:"media_player.speaker",state:"on",attributes:{volume_level:0.4}}]),{expectedAreaId:area_id});
 assert.equal(result.ok,true);
 assert.equal(result.status,"plan_only_not_authorized");
 assert.deepEqual(result.actions.map(x=>x.args.service),["turn_on","turn_on","volume_set"]);
 assert.equal(result.actions[0].args.brightness,120);
});
test("fails closed for unverified area and empty inventory",()=>{
 assert.equal(planAiScene(scene([light])).status,"unverified_area");
 assert.equal(planAiScene(scene([]),{expectedAreaId:area_id}).ok,false);
});
test("rejects duplicates, malformed IDs and forbidden domains",()=>{
 for(const entities of [[light,light],[{entity_id:"switch.test",state:"on"}],[{entity_id:"light.bad name",state:"on"}]]){
  const p=planAiScene(scene(entities),{expectedAreaId:area_id});
  assert.equal(p.ok,false);assert.deepEqual(p.actions,[]);
 }
});
test("rejects unavailable, inconsistent or unsafe stored state",()=>{
 const bad=[
  {entity_id:"light.test",state:"unknown"},
  {entity_id:"light.test",state:"off",attributes:{brightness:100}},
  {entity_id:"light.test",state:"on",attributes:{brightness:300}},
  {entity_id:"media_player.test",state:"on",attributes:{volume_level:2}},
  {entity_id:"select.test",state:"unavailable"},
 ];
 for(const entity of bad){
  const result=planAiScene(scene([light,entity]),{expectedAreaId:area_id});
  assert.equal(result.ok,false,entity.entity_id+" / "+entity.state);
  assert.deepEqual(result.actions,[]);
 }
});
