import test from 'node:test';
import assert from 'node:assert/strict';
import {createNineLightTelegramConsent} from '../src/home/nine-light-telegram-consent.mjs';
import {RESPONDING_NEW_LIGHT_IDS} from '../src/home/responding-new-light-batch.mjs';
const owner={userId:700,chatId:700};
function journal(){const claimed=new Set();return {claim:token=>!claimed.has(token)&&!!claimed.add(token),mark:()=>true};}
test('each of nine lights can pass through consent and calls dispatch exactly once',async()=>{
 const seen=[];
 const consent=createNineLightTelegramConsent({dispatch:async x=>{seen.push(x.action);return {status:'verified'};},executionJournal:journal()});
 for(const entityId of RESPONDING_NEW_LIGHT_IDS){
  const request=consent.request(owner,{entityId,service:'turn_on'});
  assert.equal(request.requires,'/confirm');
  assert.equal((await consent.confirm(owner)).status,'verified');
  assert.equal((await consent.confirm(owner)).status,'missing');
 }
 assert.equal(seen.length,9);
 assert.deepEqual(seen.map(x=>x.args.entity_id),RESPONDING_NEW_LIGHT_IDS);
});
test('unsupported lights, spoofed users, expiry, cancel and absent dispatch fail closed',async()=>{
 let now=0;
 const consent=createNineLightTelegramConsent({clock:()=>now,executionJournal:journal()});
 for(const entityId of ['light.browser_mod_panel','light.liustra','switch.vannaia_svet']){
  assert.equal(consent.request(owner,{entityId,service:'turn_off'}).status,'denied');
 }
 assert.equal(consent.request({userId:700,chatId:701},{entityId:'light.kukhnia_svet',service:'turn_off'}).status,'denied');
 consent.request(owner,{entityId:'light.kukhnia_svet',service:'turn_off'});
 now=60000;
 assert.equal((await consent.confirm(owner)).status,'missing');
 consent.request(owner,{entityId:'light.kukhnia_svet',service:'turn_on'});
 assert.equal(consent.cancel(owner).status,'cancelled');
 assert.equal((await consent.confirm(owner)).status,'missing');
 consent.request(owner,{entityId:'light.kukhnia_svet',service:'turn_on'});
 assert.equal((await consent.confirm(owner)).reason,'trusted_dispatch_unavailable');
});
