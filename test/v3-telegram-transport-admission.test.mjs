import test from "node:test";
import {mkdtempSync,rmSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {createDurableAssistReplay} from "../src/decision/v3-assist-durable-replay.mjs";
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

test("same message under a different update ID cannot replay",()=>{
 const gate=createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000});
 assert.equal(gate.inspect(fresh()).accepted,true);
 const replay=fresh();replay.update.update_id=901;
 assert.equal(gate.inspect(replay).reason,"duplicate_transport_message");
});
test("bounded replay memory fails closed rather than evicting prior IDs",()=>{
 const gate=createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000,maxSeen:1});
 assert.equal(gate.inspect(fresh()).accepted,true);
 const another=fresh();another.update.update_id=901;another.message.message_id=8;
 assert.equal(gate.inspect(another).reason,"replay_capacity_exhausted");
 assert.equal(gate.inspect(fresh()).reason,"duplicate_transport_message");
});


test("offline durable Telegram replay survives adapter restart and changed update ID",()=>{
 const directory=mkdtempSync(join(tmpdir(),"telegram-replay-"));
 try{
  const create=()=>createTelegramTransportAdmission({
   allowedUserId:55,clock:()=>1000000,
   durableReplay:createDurableAssistReplay({directory}),
  });
  assert.equal(create().inspect(fresh()).accepted,true);
  const forged=fresh();forged.update.update_id=999;
  assert.equal(create().inspect(forged).reason,"replayed_event");
  const freshMessage=fresh();freshMessage.update.update_id=1000;freshMessage.message.message_id=8;
  assert.equal(create().inspect(freshMessage).accepted,true);
 }finally{rmSync(directory,{recursive:true,force:true});}
});
test("offline durable replay storage failures fail closed",()=>{
 const gate=createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000,durableReplay:{claim(){throw Error("unavailable")}}});
 assert.equal(gate.inspect(fresh()).reason,"replay_storage_failed");
 const malformed=createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000,durableReplay:{}});
 assert.equal(malformed.inspect(fresh()).reason,"replay_storage_unavailable");
});

test("raw update and convenience fields must agree when both supplied",()=>{
 const ok=fresh();ok.update.message={...ok.message};
 assert.equal(createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000}).inspect(ok).accepted,true);
 for(const message of [
  {...ok.message,text:"Выключи свет"},
  {...ok.message,from:{id:56}},
  {...ok.message,message_id:8},
 ]){
  const forged={...ok,update:{...ok.update,message}};
  const result=createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000}).inspect(forged);
  assert.equal(result.accepted,false);assert.equal(result.authorization,undefined);
 }
});

test("non-message Telegram update cannot be promoted to a text command",()=>{
 for(const kind of ["callback_query","edited_message","channel_post","inline_query"]){
  const ctx=fresh();ctx.update[kind]={id:"fixture"};
  const r=createTelegramTransportAdmission({allowedUserId:55,clock:()=>1000000}).inspect(ctx);
  assert.equal(r.accepted,false);
  assert.equal(r.reason,"unsupported_transport_update");
 }
});
