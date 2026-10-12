import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync,chmodSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {provisionV3PilotJournal} from '../src/ops/v3-pilot-journal-provision.mjs';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';

test('operator provisioner creates protected DB once and preserves claims across reuse',()=>{
 const root=mkdtempSync(join(tmpdir(),'journal-provision-'));
 try{
  const rollbackRoot=join(root,'rollback'),directory=join(root,'claims');
  mkdirSync(rollbackRoot);
  const created=provisionV3PilotJournal({directory,rollbackRoot});
  assert.equal(created.status,'created');
  assert.equal(statSync(created.dbPath).mode&0o777,0o600);
  const j=createGateCExecutionJournal({dbPath:created.dbPath});
  assert.equal(j.claim('fixture-action-123456789'),true);
  assert.equal(provisionV3PilotJournal({directory,rollbackRoot}).status,'existing');
  assert.equal(createGateCExecutionJournal({dbPath:created.dbPath}).claim('fixture-action-123456789'),false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('operator provisioner refuses unsafe existing journal rather than resetting it',()=>{
 const root=mkdtempSync(join(tmpdir(),'journal-provision-'));
 try{
  const rollbackRoot=join(root,'rollback'),directory=join(root,'claims');
  mkdirSync(rollbackRoot);
  const {dbPath}=provisionV3PilotJournal({directory,rollbackRoot});
  chmodSync(dbPath,0o644);
  assert.throws(()=>provisionV3PilotJournal({directory,rollbackRoot}),/existing_journal_untrusted/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
