import {createV3IntentLedger} from "./v3-intent-ledger.mjs";

// Isolated simulation only: this module has no HA/MCP service client.
// Scope approval is distinct from production execution authorization.
const TARGET="light.ves_svet";
const TEXT="выключи весь свет";
export function createV3WholeHouseOffMock({readGroup,simulateWrite,reviewedMembers,now=Date.now,verifyRegistryAtDispatch}={}){
 if(typeof readGroup!=="function" || typeof simulateWrite!=="function")
  throw Error("missing_mock_dependencies");
 if(!Array.isArray(reviewedMembers) || reviewedMembers.length!==14 ||
    new Set(reviewedMembers).size!==14 ||
    reviewedMembers.some(id=>typeof id!=="string" || !/^light\.[a-z0-9_]+$/.test(id)))
  throw Error("missing_reviewed_membership");
 const approved=new Set(reviewedMembers);
 const ledger=createV3IntentLedger({clock:now});
 return Object.freeze({
  issue({userId,chatId,text}={}){
   const normalized=typeof text==="string"?text.toLocaleLowerCase("ru-RU").replace(/ё/g,"е").trim():null;
   if(normalized!==TEXT)return {status:"denied",reason:"not_exact_whole_house_off"};
   const action={name:"ha_call_service",args:{domain:"light",service:"turn_off",entity_id:TARGET}};
   return {status:"pending",...ledger.issue({userId,chatId,userText:text,action})};
  },
  async confirm({userId,chatId,token}={}){
   const actor={userId,chatId,token};
   const pending=ledger.inspect(actor);
   if(!pending)return {status:"missing"};
   let observed;
   try{observed=await readGroup(TARGET);}catch{return {status:"denied",reason:"group_read_failed"};}
   const members=observed?.attributes?.entity_id;
   if(observed?.entity_id!==TARGET || observed?.platform!=="group" ||
      !Array.isArray(members) || members.length!==14 ||
      members.some(id=>typeof id!=="string" || !/^light\.[a-z0-9_]+$/.test(id)) ||
      new Set(members).size!==members.length || members.some(id=>!approved.has(id)))return {status:"denied",reason:"untrusted_group_membership"};
   if(verifyRegistryAtDispatch!==undefined){
    if(typeof verifyRegistryAtDispatch!=="function")return {status:"denied",reason:"invalid_registry_guard"};
    let evidence;
    try{evidence=await verifyRegistryAtDispatch({actor:{userId,chatId},action:structuredClone(pending.action)});}
    catch{return {status:"denied",reason:"registry_evidence_failed"};}
    if(evidence?.valid!==true)return {status:"denied",reason:"registry_changed_or_unverified"};
   }
   const consumed=ledger.consume(actor);
   if(!consumed)return {status:"missing"};
   if(consumed.action?.args?.entity_id!==TARGET || consumed.action?.args?.service!=="turn_off")
    return {status:"denied",reason:"action_changed"};
   try{
    const result=await simulateWrite("ha_call_service",{...consumed.action.args});
    if(result?.success!==true && result?.structuredContent?.success!==true)
     return {status:"failed",reason:"mock_write_not_accepted"};
    return {status:"simulated",memberCount:members.length};
   }catch{return {status:"failed"};}
  },
  cancel:({userId,chatId}={})=>ledger.cancel({userId,chatId}),
 });
}
