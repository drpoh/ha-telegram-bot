import test from 'node:test';
import assert from 'node:assert/strict';
import {planManualLightAction} from '../src/home/manual-light-action-plan.mjs';
test('manual toggle can only be proposed after exact owner selection and physical identity review',()=>{
 for(const action of ['on','off']){
  const r=planManualLightAction({entityId:'light.kukhnia_svet',action,
   ownerSelectedIds:['light.kukhnia_svet'],physicalIdentityConfirmedIds:['light.kukhnia_svet']});
  assert.equal(r.status,'pending_confirmation');
  assert.equal(r.requires,'/confirm');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
});
test('deny unknown, Browser Mod, ambiguous, missing confirmation and unsupported actions',()=>{
 for(const v of [
  {entityId:'light.kukhnia_svet',action:'on',ownerSelectedIds:['light.kukhnia_svet']},
  {entityId:'light.kukhnia_svet',action:'on',physicalIdentityConfirmedIds:['light.kukhnia_svet']},
  {entityId:'light.browser_mod_x',action:'on',ownerSelectedIds:['light.browser_mod_x'],physicalIdentityConfirmedIds:['light.browser_mod_x']},
  {entityId:'light.kukhnia_svet',action:'toggle',ownerSelectedIds:['light.kukhnia_svet'],physicalIdentityConfirmedIds:['light.kukhnia_svet']},
  {entityId:'switch.vannaia_svet',action:'off',ownerSelectedIds:['switch.vannaia_svet'],physicalIdentityConfirmedIds:['switch.vannaia_svet']}
 ]){
  const r=planManualLightAction(v);
  assert.equal(r.status,'denied');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 }
});
