import test from "node:test";
import assert from "node:assert/strict";
import {proposeEntityRenames} from "../src/home/entity-rename-audit.mjs";
const base={entity_id:"light.old",platform:"z2m",unique_id:"abc",name:"Кухня"};
test("identity-based rename is proposal only, never automatic migration",()=>{
 const r=proposeEntityRenames({before:[base],after:[{...base,entity_id:"light.new",name:"Любое имя"}]});
 assert.equal(r.proposals.length,1);assert.equal(r.proposals[0].status,"review_required");
 assert.equal(r.automatic_changes,0);
});
test("same entity ID remains valid despite name changes",()=>{
 const r=proposeEntityRenames({before:[base],after:[{...base,name:"Новое имя"}]});
 assert.equal(r.proposals.length,0);assert.equal(r.unresolved.length,0);
});
test("unknown or duplicated identities cannot silently remap",()=>{
 for(const after of [
  [{entity_id:"light.new",name:"Кухня"}],
  [{...base,entity_id:"switch.new"}],
  [{...base,entity_id:"light.new",unique_id:"other"}],
  [{...base,entity_id:"light.a"},{...base,entity_id:"light.b"}],
 ]){
  const r=proposeEntityRenames({before:[base],after});
  assert.equal(r.proposals.length,0);
  assert.equal(r.unresolved.length,1);
 }
 assert.throws(()=>proposeEntityRenames({before:[base,base],after:[]}),/invalid_entity_inventory/);
});
