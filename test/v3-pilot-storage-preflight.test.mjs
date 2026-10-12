import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,chmodSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';
import {inspectV3PilotStorage} from '../src/ops/v3-pilot-storage-preflight.mjs';
const fixture=()=>{const base=mkdtempSync(join(tmpdir(),'pilot-storage-'));const rollback=join(base,'release'),protectedDir=join(base,'protected');mkdirSync(rollback);mkdirSync(protectedDir,{mode:0o700});return {base,rollback,protectedDir,close:()=>rmSync(base,{recursive:true,force:true})};};
test('pilot storage rejects missing and rollback-located ledgers',()=>{
 const f=fixture();try{
  const missing=join(f.protectedDir,'missing.db');
  assert.equal(inspectV3PilotStorage({dbPath:missing,rollbackRoot:f.rollback}).ready,false);
  const inRollback=join(f.rollback,'claims.db');createGateCExecutionJournal({dbPath:inRollback});chmodSync(inRollback,0o600);
  assert.equal(inspectV3PilotStorage({dbPath:inRollback,rollbackRoot:f.rollback}).reason,'ledger_inside_rollback');
 }finally{f.close();}
});
test('pilot storage accepts protected existing separate SQLite claims and denies world-readable',()=>{
 const f=fixture();try{
  const db=join(f.protectedDir,'claims.db');createGateCExecutionJournal({dbPath:db});chmodSync(db,0o600);
  assert.equal(inspectV3PilotStorage({dbPath:db,rollbackRoot:f.rollback}).ready,true);
  chmodSync(db,0o644);
  assert.equal(inspectV3PilotStorage({dbPath:db,rollbackRoot:f.rollback}).reason,'unsafe_ownership_or_permissions');
 }finally{f.close();}
});
test('pilot storage denies symlinked journal',()=>{
 const f=fixture();try{
  const real=join(f.protectedDir,'real.db'),alias=join(f.protectedDir,'alias.db');
  createGateCExecutionJournal({dbPath:real});chmodSync(real,0o600);symlinkSync(real,alias);
  assert.equal(inspectV3PilotStorage({dbPath:alias,rollbackRoot:f.rollback}).ready,false);
 }finally{f.close();}
});
