import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_LIGHT_CANDIDATES,NEW_LIGHT_IDS,validateNewLightCandidates} from '../src/home/new-light-candidates.mjs';

test('new lights review catalog has explicit IDs, no Browser Mod or existing pilot IDs',()=>{
 assert.equal(validateNewLightCandidates(),true);
 assert.equal(NEW_LIGHT_IDS.length,19);
 assert.equal(new Set(NEW_LIGHT_IDS).size,NEW_LIGHT_IDS.length);
 assert.ok(NEW_LIGHT_IDS.every(id=>id.startsWith('light.')&&!id.startsWith('light.browser_mod')));
 for(const old of ['light.tambur_svet_l1','light.koridor','light.koridor_1_etazh','light.koridor_spot']){
  assert.equal(NEW_LIGHT_IDS.includes(old),false);
 }
 assert.ok(NEW_LIGHT_CANDIDATES.every(v=>v.readOnly&&v.review==='unverified'));
});
test('fail-closed candidate validation rejects duplicates and forbidden prefixes',()=>{
 const first=NEW_LIGHT_CANDIDATES[0];
 assert.equal(validateNewLightCandidates([first,first]),false);
 assert.equal(validateNewLightCandidates([{...first,id:'light.browser_mod_screen'}]),false);
 assert.equal(validateNewLightCandidates([{...first,id:'light.koridor'}]),false);
 assert.equal(validateNewLightCandidates([{...first,readOnly:false}]),false);
 assert.equal(validateNewLightCandidates([{...first,review:'approved'}]),false);
 assert.equal(validateNewLightCandidates([]),false);
});
