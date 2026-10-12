import {lstatSync,realpathSync,statSync} from 'node:fs';
import {isAbsolute,resolve,relative,sep} from 'node:path';
import {executeSql} from '../db/database.mjs';

// Purely local, read-only preflight. Never creates a missing DB or starts HA.
export function inspectV3PilotStorage({dbPath,rollbackRoot,uid=process.getuid?.()}={}){
 const fail=reason=>({ready:false,reason});
 if(typeof dbPath!=='string'||typeof rollbackRoot!=='string'||
    !isAbsolute(dbPath)||!isAbsolute(rollbackRoot)||resolve(dbPath)!==dbPath||
    resolve(rollbackRoot)!==rollbackRoot||rollbackRoot==='/'||!dbPath.endsWith('.db'))
  return fail('invalid_paths');
 try{
  const root=realpathSync(rollbackRoot),file=realpathSync(dbPath);
  const rel=relative(root,file);
  if(rel===''||(!rel.startsWith('..'+sep)&&rel!=='..'&&!isAbsolute(rel)))
   return fail('ledger_inside_rollback');
  const s=statSync(file),direct=lstatSync(dbPath),parent=statSync(realpathSync(resolve(dbPath,'..')));
  if(direct.isSymbolicLink()||!s.isFile()||!Number.isSafeInteger(uid)||
    s.uid!==uid||parent.uid!==uid||Boolean(s.mode&0o077)||Boolean(parent.mode&0o022))
   return fail('unsafe_ownership_or_permissions');
  if(executeSql("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='gate_c_execution_claims';",file)!=='1')
   return fail('missing_claim_schema');
  if(executeSql('PRAGMA quick_check;',file)!=='ok')return fail('sqlite_integrity_failed');
  return {ready:true,reason:'storage_preflight_passed'};
 }catch{return fail('ledger_unavailable');}
}
