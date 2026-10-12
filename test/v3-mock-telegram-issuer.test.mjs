import test from "node:test";
import assert from "node:assert/strict";
import {createV3IntentLedger} from "../src/decision/v3-intent-ledger.mjs";
import {createV3MockTelegramIssuer} from "../src/decision/v3-mock-telegram-issuer.mjs";
const actor={userId:123,chatId:456};
const event=(text="Включи весь свет в Комната")=>({
 from:{id:actor.userId},chat:{id:actor.chatId},
 message:{from:{id:actor.userId},chat:{id:actor.chatId},text}
});
const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
test("authenticated fixture envelope binds original text and exact candidate",()=>{
 const ledger=createV3IntentLedger(),issuer=createV3MockTelegramIssuer({ledger,allowedUserId:123});
 const candidate=structuredClone(action);
 const result=issuer.propose(event(),candidate);
 assert.equal(result.status,"pending");
 candidate.args.entity_id="light.attacker";
 const stored=ledger.inspect({...actor,token:result.token});
 assert.equal(stored.originalUserText,"Включи весь свет в Комната");
 assert.equal(stored.action.args.entity_id,"light.fixture");
});
test("unauthorized, malformed and dangerous events cannot issue consent",()=>{
 const ledger=createV3IntentLedger(),issuer=createV3MockTelegramIssuer({ledger,allowedUserId:123});
 for(const [ctx,candidate] of [
  [{...event(),from:{id:999}},action],
  [{...event(),message:{...event().message,chat:{id:999}}},action],
  [event("/start"),action],
  [event(),{name:"ha_call_service",args:{domain:"homeassistant",service:"restart",entity_id:"light.fixture"}}],
  [event(),{name:"ha_config_set_automation",args:{}}],
 ]){
  assert.equal(issuer.propose(ctx,candidate).status,"denied");
 }
 assert.equal(ledger.inspect({...actor,token:"unissued"}),null);
});
