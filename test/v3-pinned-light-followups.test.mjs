import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPinnedLightFollowups} from '../src/pilot/v3-pinned-light-followups.mjs';

const actor={userId:123,chatId:123};
const corridor=['light.koridor','light.koridor_1_etazh','light.koridor_spot'];
const kitchen=['light.kukhnia_led_niz_l1','light.kukhnia_led_niz_l2','light.kukhnia_svet','light.led_kukhnia'];
const fixture=calls=>async entity_id=>{
 calls.push(entity_id);
 return {structuredContent:{data:{entity_id,state:'off'}}};
};
const follow=(router,text,read,other=read,id=actor)=>
 router.route({actor:id,text,readState:read,readKitchenState:other});
const remember=(router,text)=>router.remember({
 actor,text,answer:{status:'complete',authorization:false,actualWrite:false,text:'Проверено.'}
});

test('direct kitchen then corridor and kitchen followups keep fixed read boundaries',async()=>{
 let time=10000;
 const router=createPinnedLightFollowups({clock:()=>time}),general=[],special=[];
 const read=fixture(general),kread=fixture(special);
 remember(router,'Какой свет на кухне?');
 let r=await follow(router,'А в коридоре?',read,kread);
 assert.equal(r.handled,true);
 assert.equal(r.status,'complete');
 assert.deepEqual(general,corridor);
 assert.deepEqual(special,[]);
 assert.equal(r.authorization,false);
 assert.equal(r.actualWrite,false);
 r=await follow(router,'А на кухне?',read,kread);
 assert.equal(r.status,'complete');
 assert.deepEqual(special,kitchen);
 r=await follow(router,'А в тамбуре?',read,kread);
 assert.equal(r.status,'complete');
 assert.deepEqual(general,[...corridor,'light.tambur_svet_l1']);
});
test('expired, unknown actor, mixed command and no context never read',async()=>{
 let now=1000;
 const router=createPinnedLightFollowups({clock:()=>now,ttlMs:1000});
 const calls=[],reader=fixture(calls);
 assert.equal((await follow(router,'А на кухне?',reader)).status,'unsupported');
 remember(router,'Какой свет в коридоре?');
 assert.equal((await follow(router,'А в коридоре? Выключи всё',reader)).status,'unsupported');
 assert.equal((await follow(router,'А в коридоре?',reader)).status,'unsupported');
 remember(router,'Что со светом на кухне?');
 now+=1001;
 assert.equal((await follow(router,'А в коридоре?',reader)).status,'unsupported');
 remember(router,'Какой свет на кухне?');
 assert.equal((await follow(router,'А в коридоре?',reader,reader,{userId:100,chatId:200})).status,'unavailable');
 assert.deepEqual(calls,[]);
});
test('sauna and physical request break context; no write dispatcher in followup module',async()=>{
 const router=createPinnedLightFollowups({clock:()=>2000}),calls=[],read=fixture(calls);
 remember(router,'Какой свет в коридоре?');
 remember(router,'Сколько градусов в сауне?');
 assert.equal((await follow(router,'А на кухне?',read)).status,'unsupported');
 remember(router,'Какой свет в коридоре?');
 router.clear(actor);
 assert.equal((await follow(router,'А на кухне?',read)).status,'unsupported');
 assert.deepEqual(calls,[]);
 const content=readFileSync(new URL('../src/pilot/v3-pinned-light-followups.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(content,/ha_call_service|pilot\.confirm|pilot\.request|\.dispatch\(/);
});
test('existing pinned Telegram consent, single poller, and no new physical target',()=>{
 const content=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
 assert.match(content,/bot\.command\('confirm',async ctx=>/);
 assert.match(content,/bot\.command\('cancel',ctx=>/);
 assert.match(content,/const r=pilot\.request\(actor\(ctx\),ctx\.message\?\.text\);/);
 assert.match(content,/lightFollowups\.route\(/);
 assert.equal((content.match(/bot\.launch\(/g)||[]).length,1);
 assert.doesNotMatch(content,/createNewLightDispatch/);
});
