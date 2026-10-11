import test from 'node:test';
import assert from 'node:assert/strict';
import {createV3TelegramJoinedAdapter} from '../src/decision/v3-telegram-joined-adapter.mjs';
import {createV3IntentLedger} from '../src/decision/v3-intent-ledger.mjs';

test('MVP: raw Telegram fixture admission binds actor, original message, single-use intent',()=>{
 const now=Date.parse('2026-10-10T12:00:00Z');
 const ledger=createV3IntentLedger({clock:()=>now});
 const actor=111;
 const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.tambur_svet_l1'}};
 const raw={message_id:101,date:now/1000,text:'Включи свет в тамбуре',from:{id:actor},chat:{id:actor,type:'private'}};
 const ctx={from:raw.from,chat:raw.chat,message:raw,update:{update_id:555,message:raw}};
 const admit=createV3TelegramJoinedAdapter({allowedUserId:actor,clock:()=>now,requireRawMessage:true})({
  issueVerified:({actorId,sourceId,text,authenticated,action:requested,ttlMs})=>{
   assert.equal(authenticated,true);
   assert.equal(sourceId,String(actor));
   assert.deepEqual(requested,action);
   return ledger.issue({userId:actorId,chatId:Number(sourceId),userText:text,action:requested,ttlMs});
  }
 });
 const issued=admit({ctx,action,ttlMs:30000});
 const record=ledger.inspect({userId:actor,chatId:actor,token:issued.token});
 assert.equal(record.originalUserText,raw.text);
 assert.equal(record.action.args.entity_id,'light.tambur_svet_l1');
 assert.equal(admit({ctx,action,ttlMs:30000}).status,'denied');
 assert.equal(ledger.consume({userId:actor,chatId:actor,token:issued.token}).token,issued.token);
 assert.equal(ledger.consume({userId:actor,chatId:actor,token:issued.token}),null);
});
test('MVP: substituted raw text, another actor and non-private chat cannot issue',()=>{
 const now=Date.parse('2026-10-10T12:00:00Z'), userId=123;
 let issues=0;
 const admit=createV3TelegramJoinedAdapter({allowedUserId:userId,clock:()=>now,requireRawMessage:true})({
  issueVerified:()=>{issues++;return {status:'issued'};}
 });
 const message={message_id:22,date:now/1000,text:'Включи свет',from:{id:userId},chat:{id:userId,type:'private'}};
 const base={from:message.from,chat:message.chat,message,update:{update_id:5,message}};
 const changes=[
  {...base,message:{...message,text:'Выключи свет'}},
  {...base,from:{id:999}},
  {...base,chat:{...message.chat,type:'group'}},
  {...base,update:{update_id:5}},
 ];
 for(const ctx of changes)assert.equal(admit({ctx,action:{name:'ha_call_service',args:{}}}).status,'denied');
 assert.equal(issues,0);
});
