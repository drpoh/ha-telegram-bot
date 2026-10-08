import test from "node:test";
import assert from "node:assert/strict";
import {createIsolatedV3JoinedChain} from "../src/decision/v3-isolated-joined-chain.mjs";
import {createV3TelegramIngressFixture} from "../src/decision/v3-telegram-ingress-fixture.mjs";

const action={name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.fixture"}};
const ctx={from:{id:55},chat:{id:66},message:{from:{id:55},chat:{id:66},date:1000,text:"Включи весь свет в Комната"}};
test("transport fixture authorizes only allowlisted, coherent Telegram update",()=>{
 let writes=0,reads=0;
 const chain=createIsolatedV3JoinedChain({
  telegramIngress:createV3TelegramIngressFixture({allowedUserId:55,clock:()=>1000000}),
  clock:()=>1000000,policy:{},configPath:"/none",
  readTool:async()=>{reads++;throw Error("no evidence");},
  simulateWrite:async()=>{writes++;throw Error("no writes");},
 });
 for(const bad of [
  {...ctx,from:{id:77}},
  {...ctx,message:{...ctx.message,from:{id:77}}},
  {...ctx,message:{...ctx.message,chat:{id:999}}},
  {...ctx,message:{...ctx.message,date:800}},
  {...ctx,message:{...ctx.message,text:"/start"}},
  {...ctx,message:{...ctx.message,text:"Выключи весь свет в Комната"}},
 ])assert.equal(chain.issueFromTransport({ctx:bad,action}).status,"denied");
 assert.equal(chain.issueFromTransport({ctx,action,authenticated:true,actorId:55}).status,"pending");
 assert.equal(chain.issue({ctx,action,authenticated:true}).status,"denied");
 assert.equal(writes,0);
 assert.equal(reads,0);
});
