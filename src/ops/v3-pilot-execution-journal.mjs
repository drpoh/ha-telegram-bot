import {inspectV3PilotStorage} from './v3-pilot-storage-preflight.mjs';
import {createGateCExecutionJournal} from '../decision/v3-gate-c-execution-journal.mjs';

// Deployment adapter: deliberately fail closed without creating any storage.
// Keeps the pilot responsive in read-only mode if SQLite becomes unavailable.
export function prepareV3PilotExecutionJournal({dbPath,rollbackRoot,uid}={}){
 const deny=Object.freeze({claim:()=>false});
 const preflight=inspectV3PilotStorage({dbPath,rollbackRoot,uid});
 if(!preflight.ready)return Object.freeze({ready:false,reason:preflight.reason,journal:deny});
 try{
  const journal=createGateCExecutionJournal({dbPath});
  return Object.freeze({ready:true,reason:'ready',journal});
 }catch{
  return Object.freeze({ready:false,reason:'journal_open_failed',journal:deny});
 }
}
