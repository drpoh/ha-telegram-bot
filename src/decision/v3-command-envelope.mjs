// Reference-only normalized ingress. Source identity is assigned by trusted
// adapters, never inferred from speech or a model-generated text.
const SOURCES=new Set(["telegram","assist","local_test"]);
export function normalizeV3Command({source,sourceId,actorId,text,authenticated=false,issuedAt}={}){
 if(!SOURCES.has(source) || typeof sourceId!=="string" || !/^[a-zA-Z0-9_.:-]{1,100}$/.test(sourceId) ||
    typeof text!=="string" || !text.trim() || text.length>1000 ||
    !Number.isSafeInteger(issuedAt) || issuedAt<0)
  return {accepted:false,reason:"invalid_envelope"};
 if(source==="assist" && (authenticated || actorId!=null))
  return {accepted:false,reason:"voice_identity_unverified"};
 if(source==="telegram" && (!authenticated || !Number.isSafeInteger(actorId)))
  return {accepted:false,reason:"telegram_auth_required"};
 if(source==="local_test" && (authenticated || actorId!=null))
  return {accepted:false,reason:"test_identity_forbidden"};
 return {accepted:true,command:Object.freeze({
  source,sourceId,actorId:source==="telegram"?actorId:null,
  assurance:source==="telegram"?"authenticated_transport":"device_only",
  originalText:text.trim(),issuedAt,
 })};
}
export function mayRequestV3Action(command,{risk="low",requiresPersonalIdentity=false}={}){
 if(!command || !["authenticated_transport","device_only"].includes(command.assurance))
  return false;
 if(requiresPersonalIdentity || risk!=="low")
  return command.assurance==="authenticated_transport" && Number.isSafeInteger(command.actorId);
 return true;
}
