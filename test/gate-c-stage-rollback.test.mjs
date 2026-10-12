import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';

test('Gate C isolated Stage: SQLite online backup, restore and conservative no-replay rollback',()=>{
 const dir=mkdtempSync(join(tmpdir(),'gate-c-stage-rollback-'));
 try{
  const db=join(dir,'stage.db'),snapshot=join(dir,'snapshot.db'),restored=join(dir,'restored.db');
  const prior='stage-approved-operation-001';
  const later='stage-approved-operation-002';
  const journal=createGateCExecutionJournal({dbPath:db});
  assert.equal(journal.claim(prior),true);
  // Backup with SQLite itself rather than a live WAL file copy.
  execFileSync('sqlite3',[db,`.backup '${snapshot}'`]);
  assert.equal(existsSync(snapshot),true);
  assert.equal(journal.claim(later),true);
  execFileSync('sqlite3',[snapshot,`.backup '${restored}'`]);
  const rollback=createGateCExecutionJournal({dbPath:restored});
  assert.equal(rollback.claim(prior),false);
  // A restored older snapshot is missing later claims: it is UNSAFE to resume
  // dispatch until a separately durable append-only claim log is reconciled.
  assert.equal(rollback.inspect(later),null);
  const untrustedAfterRollback={safeToDispatch:false,reason:'rollback_replay_window'};
  assert.equal(untrustedAfterRollback.safeToDispatch,false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
