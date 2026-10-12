import {existsSync,realpathSync,statSync} from 'node:fs';
import {resolve,isAbsolute,relative,sep} from 'node:path';
import {executeSql} from '../db/database.mjs';
import {createGateCExecutionJournal} from '../decision/v3-gate-c-execution-journal.mjs';

// Offline stage-only recovery gate. The claim database must be OUTSIDE the
// rollback tree, provisioned in advance and never replaced by a stage snapshot.
// A missing/invalid ledger is a hard stop, not a reason to create an empty one.
const validPath=value=>typeof value==='string'&&isAbsolute(value)&&resolve(value)===value;
const inside=(parent,child)=>child===parent||(!relative(parent,child).startsWith('..'+sep)&&relative(parent,child)!=='..'&&!isAbsolute(relative(parent,child)));
export function inspectGateCStageRecovery({rollbackRoot,claimDbPath}={}){
 const fail=reason=>Object.freeze({safeToResume:false,reason});
 if(!validPath(rollbackRoot)||!validPath(claimDbPath)||rollbackRoot==='/'||!claimDbPath.endsWith('.db'))return fail('invalid_paths');
 try{
  const root=realpathSync(rollbackRoot);
  const file=realpathSync(claimDbPath);
  if(inside(root,file))return fail('ledger_inside_rollback_tree');
  if(!existsSync(file)||!statSync(file).isFile())return fail('ledger_missing');
  // Do not open with CREATE until existence and an existing schema are proven.
  const row=executeSql("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='gate_c_execution_claims';",file);
  if(row!=='1')return fail('ledger_schema_unverified');
  if(executeSql('PRAGMA quick_check;',file)!=='ok')return fail('ledger_integrity_failed');
  const journal=createGateCExecutionJournal({dbPath:file});
  return Object.freeze({safeToResume:true,reason:'isolated_fixture_ready',journal});
 }catch{return fail('ledger_unavailable');}
}
