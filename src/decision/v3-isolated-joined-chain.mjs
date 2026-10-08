import {normalizeV3Command} from "./v3-command-envelope.mjs";
import {createV3IntentLedger} from "./v3-intent-ledger.mjs";
import {createLedgerBoundMockDispatcher} from "./v3-ledger-bound-mock.mjs";
import {checkV3ToolBoundary} from "./v3-tool-boundary.mjs";
import {extractRoomWideLightQuery} from "./agent-area-guard.mjs";
import {createV3WholeHouseOffMock} from "./v3-whole-house-off-mock.mjs";

// Offline test-only adapter. Trusted caller supplies transport-authenticated
// actor, not model-generated identity. No real MCP write client is imported.
export function createIsolatedV3JoinedChain({policy,configPath,readTool,simulateWrite,clock=Date.now,telegramIngress,wholeHouseOff}={}){
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
 const whole=wholeHouseOff?.enabled===true ? createV3WholeHouseOffMock({
  readGroup:wholeHouseOff.readGroup,reviewedMembers:wholeHouseOff.reviewedMembers,
  simulateWrite,now:clock,
 }):null;
 const wholeTokens=new Map();
 return Object.freeze({
  issue(){return {status:"denied",reason:"untrusted_transport"};},
  issueFromTransport:issueFromTransport || (()=>({status:"denied",reason:"transport_unavailable"})),
  async confirm({userId,chatId,token}={}){
   if(wholeTokens.has(token)){
    const saved=wholeTokens.get(token);
    if(saved.userId!==userId || saved.chatId!==chatId)return {status:"missing"};
    wholeTokens.delete(token);
    return whole.confirm({userId,chatId,token});
   }
   return dispatch({userId,chatId,token});
  },
  cancel({userId,chatId}={}){
   const a=ledger.cancel({userId,chatId});
   const b=whole?.cancel({userId,chatId})??false;
   return a||b;
  },
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
   if(intent==="выключи весь свет"){
    if(!whole || requestedService!=="turn_off" ||
       action?.name!=="ha_call_service" ||
       action?.args?.domain!=="light" ||
       action?.args?.entity_id!=="light.ves_svet" ||
       !checkV3ToolBoundary(action).allowed)
      return {status:"denied",reason:"whole_house_scope_not_approved"};
    const issued=whole.issue({userId:command.actorId,chatId:Number(command.sourceId),
     text:command.originalText});
    if(issued.status==="pending")wholeTokens.set(issued.token,{userId:command.actorId,chatId:Number(command.sourceId)});
    return {actor:{userId:command.actorId,chatId:Number(command.sourceId)},...issued};
   }
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
