import test from "node:test";
import assert from "node:assert/strict";
import {getV3ReviewedPolicy,getLegacyPolicyInventory} from "../src/decision/v3-trusted-policy-source.mjs";
test("v3 cannot inherit autonomous v2 permissions without review",()=>{
 const policy=getV3ReviewedPolicy();
 assert.deepEqual(policy,{default:"deny",entities:{}});
 assert.ok(getLegacyPolicyInventory().count>0);
 policy.entities["light.any"]={level:"confirm",services:["turn_on"]};
 assert.deepEqual(getV3ReviewedPolicy().entities,{});
});
