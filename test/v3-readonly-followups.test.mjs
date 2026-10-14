import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createV3ReadonlyFollowupRouter} from '../src/pilot/v3-readonly-followup-router.mjs';

const actor={userId:123,chatId:123};
const fixture=(calls=[],states={})=>async id=>{
 calls.push(id);
 const state=Object.hasOwn(states,id)?states[id]:'off';
 if(state==='throw')throw Error('SECRET_TOKEN_SHOULD_NOT_LEAK');
 return {structuredContent:{data:{entity_id:id,state}}};
};
const corridor=['light.koridor','light.koridor_1_etazh','light.koridor_spot'];
const kitchen=['light.kukhnia_led_niz_l1','light.kukhnia_led_niz_l2','light.kukhnia_svet','light.led_kukhnia'];
const request=(route,text,readState,readKitchenState,identity=actor)=>
 route({actor:identity,text,readState,readKitchenState});

test('Russian kitchen question then corridor follow-up reads only already reviewed corridor IDs',async()=>{
 const calls=[],read=fixture(calls,{'light.koridor':'on','light.koridor_spot':'unavailable'});
 const router=createV3ReadonlyFollowupRouter({clock:()=>10000});
 const first=await request(router.route,'Что со светом на кухне?',read,read);
 assert.equal(first.handled,true);
 assert.equal(first.status,'complete');
 assert.deepEqual(calls,kitchen);
 calls.length=0;
 const second=await request(router.route,'А в коридоре?',read,read);
 assert.equal(second.handled,true);
 assert.equal(second.status,'partial');
 assert.deepEqual(calls,corridor);
 assert.match(second.text,/3 выбранные сущности/);
 assert.match(second.text,/включено 1, выключено 1, недоступно или неизвестно 1/);
 assert.match(second.text,/не весь физический свет коридора/);
 assert.equal(second.actualWrite,false);
 assert.equal(second.authorization,false);
});

test('No context, wrong actor, new chat, and TTL expiry fail closed without HA calls',async()=>{
 let now=10000;
 const router=createV3ReadonlyFollowupRouter({clock:()=>now,ttlMs:1000});
 const calls=[],read=fixture(calls);
 assert.equal((await request(router.route,'А в коридоре?',read,read)).status,'unsupported');
 assert.equal((await request(router.route,'Что со светом в тамбуре?',read,read,{userId:124,chatId:125})).status,'unavailable');
 await request(router.route,'Что со светом в тамбуре?',read,read);
 calls.length=0;
 assert.equal((await request(router.route,'А в коридоре?',read,read,{userId:125,chatId:125})).status,'unsupported');
 assert.deepEqual(calls,[]);
 now+=1001;
 assert.equal((await request(router.route,'А в коридоре?',read,read)).status,'unsupported');
 assert.deepEqual(calls,[]);
});

test('A sauna question cannot be used as a light target and mixed commands never get read access',async()=>{
 const router=createV3ReadonlyFollowupRouter({clock:()=>10000});
 const calls=[],read=fixture(calls);
 await request(router.route,'Сколько градусов в сауне?',read,read);
 calls.length=0;
 assert.equal((await request(router.route,'А в коридоре?',read,read)).status,'unsupported');
 assert.deepEqual(calls,[]);
 await request(router.route,'Что со светом в тамбуре?',read,read);
 calls.length=0;
 const mixed=await request(router.route,'А в коридоре? Выключи всё',read,read);
 assert.equal(mixed.status,'unsupported');
 assert.equal(mixed.authorization,false);
 assert.deepEqual(calls,[]);
 assert.equal((await request(router.route,'А в коридоре?',read,read)).status,'unsupported');
});

test('Unavailable, inconsistent HA data, and exceptions never count as off or leak errors',async()=>{
 const router=createV3ReadonlyFollowupRouter({clock:()=>10000});
 const read=fixture([],{'light.koridor':'unavailable','light.koridor_1_etazh':'throw','light.koridor_spot':'unknown'});
 await request(router.route,'Что со светом в тамбуре?',read,read);
 const out=await request(router.route,'А в коридоре?',read,read);
 assert.equal(out.status,'partial');
 assert.match(out.text,/включено 0, выключено 0, недоступно или неизвестно 3/);
 assert.doesNotMatch(out.text,/SECRET_TOKEN/);
 assert.equal(out.actualWrite,false);
});

test('Existing Telegram consent handlers/poller remain unchanged; new wrapper has no dispatch access',()=>{
 const source=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
 const context=readFileSync(new URL('../src/pilot/v3-readonly-followup-router.mjs',import.meta.url),'utf8');
 assert.match(source,/bot\.command\('confirm',async ctx=>/);
 assert.match(source,/const result=await pilot\.confirm\(actor\(ctx\)\)/);
 assert.match(source,/bot\.command\('cancel',ctx=>/);
 assert.match(source,/if\(!allow\(ctx\)\)return;/);
 assert.equal((source.match(/bot\.launch\(/g)||[]).length,1);
 assert.match(source,/readonlyFollowups\.route\(/);
 assert.doesNotMatch(context,/ha_call_service|\.dispatch\(|pilot\.confirm\(|pilot\.request\(/);
});

test('Kitchen and tambour follow-ups reuse only the corresponding fixed-ID readers',async()=>{
 const calls=[],kitchenCalls=[];
 const general=fixture(calls),kitchenRead=fixture(kitchenCalls,{'light.kukhnia_svet':'on'});
 const router=createV3ReadonlyFollowupRouter({clock:()=>5000});
 const first=await request(router.route,'Где горит свет?',general,kitchenRead);
 assert.equal(first.handled,true);
 calls.length=0;
 const a=await request(router.route,'А на кухне?',general,kitchenRead);
 assert.equal(a.status,'complete');
 assert.deepEqual(kitchenCalls,kitchen);
 assert.deepEqual(calls,[]);
 kitchenCalls.length=0;
 const b=await request(router.route,'А в тамбуре?',general,kitchenRead);
 assert.equal(b.status,'complete');
 assert.deepEqual(calls,['light.tambur_svet_l1']);
 assert.deepEqual(kitchenCalls,[]);
});

test('Unrecognized follow-up cannot reuse a previously valid light context',async()=>{
 const calls=[],reader=fixture(calls);
 const router=createV3ReadonlyFollowupRouter({clock:()=>10000});
 await request(router.route,'Что со светом в тамбуре?',reader,reader);
 calls.length=0;
 const invalid=await request(router.route,'А в спальне? Выключи свет',reader,reader);
 assert.equal(invalid.handled,true);
 assert.equal(invalid.status,'unsupported');
 assert.equal(invalid.actualWrite,false);
 assert.deepEqual(calls,[]);
 const after=await request(router.route,'А в коридоре?',reader,reader);
 assert.equal(after.status,'unsupported');
 assert.deepEqual(calls,[]);
});


test('Direct corridor question uses existing fixed read scope and allows read-only follow-up',async()=>{
 const calls=[],kitchenCalls=[];
 const router=createV3ReadonlyFollowupRouter({clock:()=>10000});
 const general=fixture(calls,{'light.koridor':'on'}),kitchenRead=fixture(kitchenCalls);
 const direct=await request(router.route,'Какой свет в коридоре?',general,kitchenRead);
 assert.equal(direct.handled,true);
 assert.equal(direct.status,'complete');
 assert.deepEqual(calls,corridor);
 assert.match(direct.text,/включено 1, выключено 2/);
 assert.equal(direct.authorization,false);
 assert.equal(direct.actualWrite,false);
 calls.length=0;
 const followup=await request(router.route,'А на кухне?',general,kitchenRead);
 assert.equal(followup.status,'complete');
 assert.deepEqual(calls,[]);
 assert.deepEqual(kitchenCalls,kitchen);
 assert.equal(followup.actualWrite,false);
});

test('Corridor write requests and unknown corridor entities never extend fixed reads',async()=>{
 const calls=[],read=fixture(calls);
 const router=createV3ReadonlyFollowupRouter({clock:()=>10000});
 const mixed=await request(router.route,'Какой свет в коридоре? Выключи всё',read,read);
 assert.equal(mixed.status,'unsupported');
 assert.deepEqual(calls,[]);
 const follow=await request(router.route,'А на кухне?',read,read);
 assert.equal(follow.status,'unsupported');
 assert.deepEqual(calls,[]);
});
