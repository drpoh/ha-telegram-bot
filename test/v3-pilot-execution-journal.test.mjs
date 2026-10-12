import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,chmodSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';
import {prepareV3PilotExecutionJournal} from '../src/ops/v3-pilot-execution-journal.mjs';

test('V3 pilot missing ledger gives deny-only journal and never creates database',()=>{
 const root=mkdtempSync(join(tmpdir(),'v3-pilot-final-'));
 try{
  const release=join(root,'release'),protectedDir=join(root,'protected'),db=join(protectedDir,'claims.db');
  mkdirSync(release);mkdirSync(protectedDir,{mode:0o700});
  const pilot=prepareV3PilotExecutionJournal({dbPath:db,rollbackRoot:release});
  assert.equal(pilot.ready,false);
  assert.equal(pilot.journal.claim('valid-test-action-00001'),false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('V3 pilot pre-provisioned ledger permits exactly one durable claim',()=>{
 const root=mkdtempSync(join(tmpdir(),'v3-pilot-final-'));
 try{
  const release=join(root,'release'),protectedDir=join(root,'protected'),db=join(protectedDir,'claims.db');
  mkdirSync(release);mkdirSync(protectedDir,{mode:0o700});
  createGateCExecutionJournal({dbPath:db});chmodSync(db,0o600);
  const pilot=prepareV3PilotExecutionJournal({dbPath:db,rollbackRoot:release});
  assert.equal(pilot.ready,true);
  assert.equal(pilot.journal.claim('valid-test-action-00001'),true);
  assert.equal(pilot.journal.claim('valid-test-action-00001'),false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
