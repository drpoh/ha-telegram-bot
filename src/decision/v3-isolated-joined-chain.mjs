import {normalizeV3Command} from "./v3-command-envelope.mjs";
import {createV3IntentLedger} from "./v3-intent-ledger.mjs";
import {createLedgerBoundMockDispatcher} from "./v3-ledger-bound-mock.mjs";
import {checkV3ToolBoundary} from "./v3-tool-boundary.mjs";
import {extractRoomWideLightQuery} from "./agent-area-guard.mjs";

// Offline test-only adapter. Trusted caller supplies transport-authenticated
// actor, not model-generated identity. No real MCP write client is imported.
export function createIsolatedV3JoinedChain({policy,configPath,readTool,simulateWrite,clock=Date.now}={}){
 const ledger=createV3IntentLedger({clock});
 const dispatch=createLedgerBoundMockDispatcher({ledger,policy,configPath,readTool,simulateWrite});
 return Object.freeze({
  issue({source,sourceId,actorId,authenticated,text,issuedAt,action,ttlMs}={}){
   const normalized=normalizeV3Command({source,sourceId,actorId,authenticated,text,issuedAt});
   if(!normalized.accepted)return {status:"denied",reason:normalized.reason};
   const command=normalized.command;
   if(command.source!=="telegram" || command.assurance!=="authenticated_transport" ||
      !Number.isSafeInteger(Number(command.sourceId)) ||
      String(Number(command.sourceId))!==command.sourceId)
    return {status:"denied",reason:"trusted_telegram_identity_required"};
   if(clock()-command.issuedAt>60000 || command.issuedAt>clock()+5000)
    return {status:"denied",reason:"stale_command"};
   if(!extractRoomWideLightQuery(command.originalText) ||
      !checkV3ToolBoundary(action).allowed)
    return {status:"denied",reason:"untrusted_action_scope"};
   const actor={userId:command.actorId,chatId:Number(command.sourceId)};
   return {status:"pending",actor,...ledger.issue({
    ...actor,userText:command.originalText,action,ttlMs,
   })};
  },
  confirm:({userId,chatId,token}={})=>dispatch({userId,chatId,token}),
  cancel:({userId,chatId}={})=>ledger.cancel({userId,chatId}),
 });
}
