import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateV3MvpRelease,V3_MVP_REQUIRED} from '../src/ops/v3-mvp-release-gate.mjs';
test('MVP remains blocked without independently reviewed evidence',()=>{
 const result=evaluateV3MvpRelease();
 assert.equal(result.ready,false);
 assert.equal(result.missing.length,V3_MVP_REQUIRED.length);
 assert.equal(result.scope,'single_approved_light');
});
test('partial and untrusted truthy claims cannot unblock release',()=>{
 const claims=Object.fromEntries(V3_MVP_REQUIRED.map(key=>[key,true]));
 for(const key of V3_MVP_REQUIRED){
  const partial={...claims,[key]:'yes'};
  assert.equal(evaluateV3MvpRelease(partial).ready,false);
  assert.ok(evaluateV3MvpRelease(partial).missing.includes(key));
 }
});
test('complete operator-reviewed boolean evidence passes checklist, not runtime authorization',()=>{
 const claims=Object.fromEntries(V3_MVP_REQUIRED.map(key=>[key,true]));
 const result=evaluateV3MvpRelease(claims);
 assert.equal(result.ready,true);
 assert.equal(result.releaseType,'operator_review_only');
 assert.equal(typeof result.dispatch,'undefined');
});
