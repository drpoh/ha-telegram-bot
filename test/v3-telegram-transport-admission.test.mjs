import test from "node:test";
import assert from "node:assert/strict";
import {createTelegramTransportAdmission} from "../src/decision/v3-telegram-transport-admission.mjs";
const fresh=()=>({update:{update_id:900},from:{id:55},chat:{id:55,type:"private"},message:{message_id:7,from:{id:55},chat:{id:55},date:1000,text:"Включи свет"}});
test("accept once, reject repeated update and keep transport identity unapproved",()=>{
 const gate=createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000});
 const a=gate.inspect(fresh());assert.equal(a.accepted,true);assert.equal(a.authorization,false);
 assert.equal(gate.inspect(fresh()).reason,"duplicate_transport_message");
});
test("reject actor, chat, stale, missing update and forged public-channel contexts",()=>{
 const base=fresh();
 const cases=[
 {...base,from:{id:56}},
 {...base,chat:{id:56,type:"group"}},
 {...base,chat:{id:55,type:"group"}},
 {...base,message:{...base.message,from:{id:56}}},
 {...base,message:{...base.message,date:800}},
 {...base,message:{...base.message,text:"/status"}},
 {...base,update:{}}
 ];
 for(const ctx of cases)assert.equal(createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000}).inspect(ctx).accepted,false);
});
