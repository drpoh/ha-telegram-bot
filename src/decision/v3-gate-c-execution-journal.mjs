import {resolve,isAbsolute} from 'node:path';
import {executeSql,escapeSql} from '../db/database.mjs';

// SQLite PRIMARY KEY provides cross-process atomic claims. The separately
// approved pinned V3 pilot may use this through its deployment storage adapter;
// this module itself has no HA-MCP client or authorization authority.
export function createGateCExecutionJournal({dbPath}={}){
 if(typeof dbPath!=='string'||!isAbsolute(dbPath)||resolve(dbPath)!==dbPath||
    dbPath==='/'||!dbPath.endsWith('.db'))throw Error('invalid_journal_path');
 executeSql(`CREATE TABLE IF NOT EXISTS gate_c_execution_claims (
  action_id TEXT PRIMARY KEY NOT NULL,
  claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  outcome TEXT NOT NULL DEFAULT 'unknown' CHECK(outcome IN ('unknown','verified','unverified'))
 );`,dbPath);
 const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{16,128}$/.test(id);
 return Object.freeze({
  claim(actionId){
   if(!validId(actionId))return false;
   try{
    return executeSql(`INSERT OR IGNORE INTO gate_c_execution_claims(action_id)
      VALUES(${escapeSql(actionId)}); SELECT changes();`,dbPath)==='1';
   }catch{return false;} // Database faults must not authorize a service call.
  },
  mark(actionId,outcome){
   if(!validId(actionId)||!['verified','unverified'].includes(outcome))return false;
   try{
    return executeSql(`UPDATE gate_c_execution_claims SET outcome=${escapeSql(outcome)}
      WHERE action_id=${escapeSql(actionId)} AND outcome='unknown'; SELECT changes();`,dbPath)==='1';
   }catch{return false;}
  },
  inspect(actionId){
   if(!validId(actionId))return null;
   try{
    const value=executeSql(`SELECT outcome FROM gate_c_execution_claims
       WHERE action_id=${escapeSql(actionId)} LIMIT 1;`,dbPath);
    return ['unknown','verified','unverified'].includes(value)?value:null;
   }catch{return null;}
  }
 });
}

// Reserve BEFORE any potentially non-idempotent external call. If the process
// crashes or a timeout occurs, UNKNOWN remains consumed forever. Do not retry.
// A caller-provided string is not authenticated identity/permission evidence.
export async function simulateGateCClaimedDispatch({journal,actionId,admit,invoke,verify}={}){
 if(typeof journal?.claim!=='function'||typeof admit!=='function'||
    typeof invoke!=='function'||typeof verify!=='function')return {status:'denied'};
 let allowed=false;
 try{allowed=(await admit())===true;}catch{return {status:'denied'};}
 if(!allowed)return {status:'denied'};
 if(!journal.claim(actionId))return {status:'duplicate_or_unavailable'};
 try{
  const result=await invoke();
  const verified=(await verify(result))===true;
  journal.mark(actionId,verified?'verified':'unverified');
  return {status:verified?'verified':'unverified'};
 }catch{
  journal.mark(actionId,'unverified');
  return {status:'unverified'};
 }
}
