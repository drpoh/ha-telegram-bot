import {checkV3ToolBoundary} from "./v3-tool-boundary.mjs";
import {extractRoomWideLightQuery} from "./agent-area-guard.mjs";
import {authorizeConfirmedAreaLight} from "./trusted-confirmed-area.mjs";
import {verifyConfirmedLightResult} from "./confirmed-result-verification.mjs";

// Isolated only: caller provides actor and token; request/action are read from
// the private ledger. No live service client is imported or supplied by default.
export function createLedgerBoundMockDispatcher({ledger,policy,configPath,readTool,simulateWrite,verifyRegistryAtDispatch}={}){
 if(typeof ledger?.inspect!=="function" || typeof ledger?.consume!=="function" ||
  typeof readTool!=="function" || typeof simulateWrite!=="function")throw Error("missing_fixture");
 return async ({userId,chatId,token}={})=>{
  const actor={userId,chatId};
  const record=ledger.inspect({...actor,token});
  if(!record)return {status:"missing"};
  const action=record.action;
  if(!checkV3ToolBoundary({name:action.name,args:action.args}).allowed)return {status:"denied"};
  const areaQuery=extractRoomWideLightQuery(record.originalUserText);
  if(!areaQuery)return {status:"denied"};
  const decision=await authorizeConfirmedAreaLight({
   action,actor,expectedAction:record.action,policy,
   userText:record.originalUserText,areaQuery,configPath,callTool:readTool,
  });
  if(!decision?.allowed)return {status:"denied"};
  // Optional isolated registry guard: revalidate immediately after async scope
  // discovery and before consuming/dispatching. Never treat evidence as a grant.
  if(verifyRegistryAtDispatch!==undefined){
   if(typeof verifyRegistryAtDispatch!=="function")return {status:"denied",reason:"invalid_registry_guard"};
   let evidence;
   try{evidence=await verifyRegistryAtDispatch({actor,action:structuredClone(action)});}
   catch{return {status:"denied",reason:"registry_evidence_failed"};}
   if(evidence?.valid!==true)return {status:"denied",reason:"registry_changed_or_unverified"};
  }
  const consumed=ledger.consume({...actor,token});
  if(!consumed)return {status:"missing"};
  if(JSON.stringify(consumed.action)!==JSON.stringify(action) ||
   consumed.originalUserText!==record.originalUserText)return {status:"denied"};
  let serviceResult;
  try{serviceResult=await simulateWrite(action.name,structuredClone(action.args));}
  catch{return {status:"failed"};}
  const verification=await verifyConfirmedLightResult({
   action,serviceResult,readState:id=>readTool("ha_get_state",{entity_id:id}),
  });
  return {status:verification.verified?"verified":"unverified"};
 };
}
