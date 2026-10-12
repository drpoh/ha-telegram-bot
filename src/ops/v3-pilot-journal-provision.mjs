import {existsSync,mkdirSync,lstatSync,openSync,closeSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createGateCExecutionJournal} from '../decision/v3-gate-c-execution-journal.mjs';
import {inspectV3PilotStorage} from './v3-pilot-storage-preflight.mjs';

// Explicit operator-invoked operation, NEVER executed at runtime/import.
// No reset or replacement of an existing ledger.
export function provisionV3PilotJournal({directory,rollbackRoot,uid=process.getuid?.()}={}){
 if(typeof directory!=='string'||resolve(directory)!==directory||!directory.startsWith('/'))throw Error('invalid_directory');
 if(!existsSync(directory))mkdirSync(directory,{recursive:false,mode:0o700});
 const parent=lstatSync(directory);
 if(!parent.isDirectory()||parent.isSymbolicLink()||parent.uid!==uid||Boolean(parent.mode&0o077))throw Error('unsafe_journal_directory');
 const dbPath=join(directory,'claims.db');
 if(existsSync(dbPath)){
  const existing=inspectV3PilotStorage({dbPath,rollbackRoot,uid});
  if(!existing.ready)throw Error('existing_journal_untrusted');
  return {status:'existing',dbPath};
 }
 // Existing protected directory and caller-reviewed release boundary required.
 // Atomically create the file with private permissions before initializing SQLite.
 const fd=openSync(dbPath,'wx',0o600);
 closeSync(fd);
 createGateCExecutionJournal({dbPath});
 const result=inspectV3PilotStorage({dbPath,rollbackRoot,uid});
 if(!result.ready)throw Error('created_journal_failed_preflight');
 return {status:'created',dbPath};
}
