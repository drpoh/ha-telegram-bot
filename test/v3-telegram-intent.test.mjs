import test from "node:test";
import assert from "node:assert/strict";
import {extractV3TelegramIntent} from "../src/decision/v3-telegram-intent.mjs";
const ctx={from:{id:123},chat:{id:456},message:{from:{id:123},chat:{id:456},text:" Включи свет "}};
test("trusted telegram event yields exact actor and original user text",()=>{
 assert.deepEqual(extractV3TelegramIntent(ctx,{allowedUserId:123}),{accepted:true,actor:{userId:123,chatId:456},originalUserText:"Включи свет"});
});
test("telegram event adapter refuses mismatched actor chat forwarded or slash text",()=>{
 const invalid=[
  [ctx,{allowedUserId:124}],
  [{...ctx,message:{...ctx.message,from:{id:999}}},{allowedUserId:123}],
  [{...ctx,message:{...ctx.message,chat:{id:999}}},{allowedUserId:123}],
  [{...ctx,message:{...ctx.message,forward_origin:{type:"user"}}},{allowedUserId:123}],
  [{...ctx,message:{...ctx.message,text:"/start"}},{allowedUserId:123}],
  [{...ctx,message:{...ctx.message,text:"   "}},{allowedUserId:123}],
 ];
 for(const [event,settings] of invalid)assert.equal(extractV3TelegramIntent(event,settings).accepted,false);
});
