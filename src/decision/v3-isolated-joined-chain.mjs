import {normalizeV3Command} from "./v3-command-envelope.mjs";
import {createV3IntentLedger} from "./v3-intent-ledger.mjs";
import {createLedgerBoundMockDispatcher} from "./v3-ledger-bound-mock.mjs";
import {checkV3ToolBoundary} from "./v3-tool-boundary.mjs";
import {extractRoomWideLightQuery} from "./agent-area-guard.mjs";

// Offline test-only adapter. Trusted caller supplies transport-authenticated
// actor, not model-generated identity. No real MCP write client is imported.
export function createIsolatedV3JoinedChain({policy,configPath,readTool,simulateWrite,clock=Date.now,telegramIngress}={}){
 const ledger=createV3IntentLedger({clock});
 // Only an injected, trusted transport adapter can supply identity. The
 // command/model-facing issue() method accepts NO authentication flags.
 const issueCapability=Symbol("trusted_transport");
 const issueTrusted=(proof,input)=>{
  if(proof!==issueCapability)return {status:"denied",reason:"untrusted_transport"};
  return issueVerified(input);
 };
 const issueFromTransport=typeof telegramIngress==="function"?
  telegramIngress({issueVerified:input=>issueTrusted(issueCapability,input)}):null;
 const dispatch=createLedgerBoundMockDispatcher({ledger,policy,configPath,readTool,simulateWrite});
 return Object.freeze({
  issue(){return {status:"denied",reason:"untrusted_transport"};},
  issueFromTransport:issueFromTransport || (()=>({status:"denied",reason:"transport_unavailable"})),
  confirm:({userId,chatId,token}={})=>dispatch({userId,chatId,token}),
  cancel:({userId,chatId}={})=>ledger.cancel({userId,chatId}),
 });
 function issueVerified({source,sourceId,actorId,authenticated,text,issuedAt,action,ttlMs}={}){
   const normalized=normalizeV3Command({source,sourceId,actorId,authenticated,text,issuedAt});
   if(!normalized.accepted)return {status:"denied",reason:normalized.reason};
   const command=normalized.command;
   if(command.source!=="telegram" || command.assurance!=="authenticated_transport" ||
      !Number.isSafeInteger(Number(command.sourceId)) ||
      String(Number(command.sourceId))!==command.sourceId)
    return {status:"denied",reason:"trusted_telegram_identity_required"};
   if(clock()-command.issuedAt>60000 || command.issuedAt>clock()+5000)
    return {status:"denied",reason:"stale_command"};
   const intent=command.originalText.toLocaleLowerCase("ru-RU").replace(/ё/g,"е").trim();
   const requestedService=/^(?:включи|включить)\s/.test(intent)?"turn_on":
    /^(?:выключи|выключить)\s/.test(intent)?"turn_off":null;
   if(!extractRoomWideLightQuery(command.originalText) ||
      !checkV3ToolBoundary(action).allowed ||
      requestedService!==action?.args?.service)
    return {status:"denied",reason:"untrusted_action_scope"};
   const actor={userId:command.actorId,chatId:Number(command.sourceId)};
   return {status:"pending",actor,...ledger.issue({
    ...actor,userText:command.originalText,action,ttlMs,
   })};
 }
}
