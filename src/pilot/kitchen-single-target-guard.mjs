// Offline-only pre-dispatch guard. Injected evidence is NOT authentication.
// No network/client imports, and no live HA writer in this module.
const TARGET='light.led_kukhnia';
export async function inspectKitchenSingleTarget({action,verifyRegistry,verifyOwner,verifyTelegram}={}){
 const deny=reason=>({allowed:false,reason});
 if(action?.name!=='ha_call_service'||action?.args?.domain!=='light'||
    action?.args?.entity_id!==TARGET||!['turn_on','turn_off'].includes(action?.args?.service)||
    Object.keys(action.args).sort().join(',')!=='domain,entity_id,service')return deny('action_outside_pilot');
 if([verifyRegistry,verifyOwner,verifyTelegram].some(fn=>typeof fn!=='function'))return deny('missing_trusted_verifier');
 try{
  for(const [name,verify] of [['registry',verifyRegistry],['owner',verifyOwner],['telegram',verifyTelegram]]){
   const result=await verify(structuredClone(action));
   if(result?.valid!==true)return deny(name+'_verification_failed');
  }
  return {allowed:false,reason:'isolated_fixture_only_no_live_authority'};
 }catch{return deny('verification_exception');}
}
