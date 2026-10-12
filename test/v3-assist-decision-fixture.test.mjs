import test from "node:test";
import assert from "node:assert/strict";
import {createAssistDecisionFixture} from "../src/decision/v3-assist-decision-fixture.mjs";
const fixture=createAssistDecisionFixture({knownSatellites:["m5stack-echo"],reviewedLowRiskEntities:["light.fixture"]});
const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
test("Assist gets review-only path through common safe tool boundary",()=>{
 const result=fixture.assess({satelliteId:"m5stack-echo",transcript:"Включи свет",action,risk:"low"});
 assert.equal(result.outcome,"review");
 assert.equal(result.command.assurance,"device_only");
 assert.equal(result.reason,"requires_authoritative_scope_and_policy");
});
test("Assist cannot assert room, high risk permission, unreviewed device or forbidden tool",()=>{
 for(const change of [
  {claimedArea:"sauna"},{risk:"high"},{satelliteId:"forged"},
  {action:{...action,args:{...action.args,entity_id:"light.other"}}},
  {action:{name:"ha_call_service",args:{domain:"homeassistant",service:"restart",entity_id:"light.fixture"}}},
 ])assert.equal(fixture.assess({satelliteId:"m5stack-echo",transcript:"Включи свет",action,risk:"low",...change}).outcome,"deny");
});
