import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';
import {inspectGateCStageRecovery} from '../src/ops/gate-c-stage-recovery.mjs';

const setup=()=>{const root=mkdtempSync(join(tmpdir(),'gate-c-recover-'));const stage=join(root,'stage'),safe=join(root,'protected');mkdirSync(stage);mkdirSync(safe);return {root,stage,safe,dispose:()=>rmSync(root,{recursive:true,force:true})};};
test('Gate C: rollback restores stage state, keeps independent claims and denies replay',()=>{
 const f=setup();try{
  const db=join(f.safe,'claims.db'),state=join(f.stage,'state.db'),backup=join(f.root,'backup.db');
  const j=createGateCExecutionJournal({dbPath:db});
  const old='gatec-previous-confirmation-001',newer='gatec-after-snapshot-00002';
  assert.equal(j.claim(old),true);
  execFileSync('sqlite3',[state,'CREATE TABLE stage_state(value TEXT);']);
  execFileSync('sqlite3',[state,`.backup '${backup}'`]);
  assert.equal(j.claim(newer),true);
  // Stage state is restored from its old snapshot; independent claim DB is not.
  rmSync(state);execFileSync('sqlite3',[backup,`.backup '${state}'`]);
  const recovery=inspectGateCStageRecovery({rollbackRoot:f.stage,claimDbPath:db});
  assert.equal(recovery.safeToResume,true);
  assert.equal(recovery.journal.claim(old),false);
  assert.equal(recovery.journal.claim(newer),false);
 }finally{f.dispose();}
});
test('Gate C: missing ledger after rollback denies and cannot silently initialize',()=>{
 const f=setup();try{
  const db=join(f.safe,'claims.db');
  const result=inspectGateCStageRecovery({rollbackRoot:f.stage,claimDbPath:db});
  assert.equal(result.safeToResume,false);
  assert.equal(existsSync(db),false);
 }finally{f.dispose();}
});
test('Gate C: ledger inside rollback tree and schema-free database deny',()=>{
 const f=setup();try{
  const inside=join(f.stage,'claims.db');createGateCExecutionJournal({dbPath:inside});
  assert.equal(inspectGateCStageRecovery({rollbackRoot:f.stage,claimDbPath:inside}).safeToResume,false);
  const empty=join(f.safe,'empty.db');execFileSync('sqlite3',[empty,'PRAGMA user_version=1;']);
  assert.equal(inspectGateCStageRecovery({rollbackRoot:f.stage,claimDbPath:empty}).safeToResume,false);
 }finally{f.dispose();}
});
