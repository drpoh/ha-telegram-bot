import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inspectApprovalRollback} from '../src/decision/v3-approval-rollback-guard.mjs';
const record={version:1,policySha256:'a'.repeat(64)};
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
test('matching candidate/checkpoint cannot grant authority',()=>{
 const result=inspectApprovalRollback({candidate:{revision:2,record},checkpoint:{revision:2,recordSha256:hash(record)}});
 assert.equal(result.valid,true);assert.equal(result.authorized,false);
});
test('rollback, replayed old version, mutation, and missing checkpoint deny',()=>{
 const c={revision:2,record},checkpoint={revision:2,recordSha256:hash(record)};
 assert.equal(inspectApprovalRollback({candidate:{...c,revision:1},checkpoint}).reason,'rollback_detected');
 assert.equal(inspectApprovalRollback({candidate:{...c,revision:3},checkpoint}).reason,'unreviewed_new_revision');
 assert.equal(inspectApprovalRollback({candidate:{...c,record:{...record,version:2}},checkpoint}).reason,'record_replaced');
 assert.equal(inspectApprovalRollback({candidate:c}).valid,false);
});

test('malformed approval candidate fails closed without throwing',()=>{
 const checkpoint={revision:2,recordSha256:hash(record)};
 for(const bad of [undefined,null,false,0,'bad',[],{}]){
  const result=inspectApprovalRollback({candidate:{revision:2,record:bad},checkpoint});
  assert.equal(result.valid,false);
  assert.equal(result.authorized,false);
  assert.equal(result.reason,'invalid_rollback_evidence');
 }
});
