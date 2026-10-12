import test from 'node:test';
import assert from 'node:assert/strict';
import {createNineLightConfirmDryrun} from '../src/home/nine-light-confirm-dryrun.mjs';
import {RESPONDING_NEW_LIGHT_IDS} from '../src/home/responding-new-light-batch.mjs';
const actor={userId:123,chatId:123};
test('all nine candidate lights require /confirm and can never dispatch',()=>{
 const dry=createNineLightConfirmDryrun();
 for(const entityId of RESPONDING_NEW_LIGHT_IDS)for(const service of ['turn_on','turn_off']){
  assert.deepEqual(dry.request(actor,{entityId,service}),{
   status:'pending',entityId,service,requires:'/confirm',actualWrite:false
  });
  assert.deepEqual(dry.confirm(actor),{
   status:'simulated',entityId,service,actualWrite:false,message:'DEV simulation only. No HA command was sent.'
  });
  assert.equal(dry.confirm(actor).status,'missing_or_expired');
 }
});
test('expired, unauthorized and unavailable actions never execute',()=>{
 let now=100;
 const dry=createNineLightConfirmDryrun({clock:()=>now,ttlMs:100});
 for(const entityId of ['light.browser_mod_test','light.liustra','light.koridor','switch.vannaia_svet']){
  assert.equal(dry.request(actor,{entityId,service:'turn_on'}).status,'denied');
 }
 assert.equal(dry.request({userId:123,chatId:999},{entityId:'light.kukhnia_svet',service:'turn_on'}).status,'denied');
 assert.equal(dry.request(actor,{entityId:'light.kukhnia_svet',service:'toggle'}).status,'denied');
 dry.request(actor,{entityId:'light.kukhnia_svet',service:'turn_on'});
 now=200;
 assert.equal(dry.confirm(actor).status,'missing_or_expired');
 dry.request(actor,{entityId:'light.kukhnia_svet',service:'turn_off'});
 assert.equal(dry.cancel(actor).status,'cancelled');
 assert.equal(dry.confirm(actor).status,'missing_or_expired');
});
