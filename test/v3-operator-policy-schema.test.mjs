import test from "node:test";
import assert from "node:assert/strict";
import {validateV3OperatorPolicy} from "../src/decision/v3-operator-policy-schema.mjs";
const base={version:1,default:"deny",entities:{"light.fixture":{level:"confirm",services:["turn_on","turn_off"]}}};
test("reviewed-style policy data is schema-valid but never self-authorizing",()=>{
 const result=validateV3OperatorPolicy(base);
 assert.equal(result.valid,true);
 assert.equal(result.status,"schema_valid_only_not_approved");
 assert.deepEqual(result.policy.entities["light.fixture"].services,["turn_on","turn_off"]);
 base.entities["light.fixture"].services[0]="restart";
 assert.deepEqual(result.policy.entities["light.fixture"].services,["turn_on","turn_off"]);
});
test("policy schema rejects implicit autonomy, unknown targets, services and fields",()=>{
 const valid={version:1,default:"deny",entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}};
 for(const altered of [
  {...valid,default:"auto_safe"},
  {...valid,entities:{"light.fixture":{level:"auto_safe",services:["turn_on"]}}},
  {...valid,entities:{"switch.fixture":{level:"confirm",services:["turn_on"]}}},
  {...valid,entities:{"light.fixture":{level:"confirm",services:["toggle"]}}},
  {...valid,entities:{"light.fixture":{level:"confirm",services:["turn_on","turn_on"]}}},
  {...valid,entities:{"light.fixture":{level:"confirm",services:["turn_on"],override:true}}},
  {...valid,unreviewed:true},
  {...valid,entities:null},
 ])assert.equal(validateV3OperatorPolicy(altered).valid,false);
});
