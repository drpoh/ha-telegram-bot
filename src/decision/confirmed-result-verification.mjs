// Isolated v3 post-execution verification contract. Never performs service calls.
export async function verifyConfirmedLightResult({action,serviceResult,readState}={}){
 const fail=status=>({verified:false,status});
 if(action?.name!=="ha_call_service" || action?.args?.domain!=="light" ||
    !["turn_on","turn_off"].includes(action?.args?.service) ||
    !/^light\.[a-z0-9_]+$/.test(action?.args?.entity_id||"") ||
    typeof readState!=="function")return fail("invalid_verification_request");
 const accepted=serviceResult?.isError!==true &&
   (serviceResult?.structuredContent??serviceResult)?.success===true;
 if(!accepted)return fail("service_not_accepted");
 try{
  const reply=await readState(action.args.entity_id);
  const data=(reply?.structuredContent??reply)?.data??(reply?.structuredContent??reply);
  if(data?.entity_id!==action.args.entity_id)return fail("state_identity_mismatch");
  const expected=action.args.service==="turn_on"?"on":"off";
  return data?.state===expected?{verified:true,status:"confirmed"}:fail("state_pending");
 }catch{return fail("state_read_failed");}
}
