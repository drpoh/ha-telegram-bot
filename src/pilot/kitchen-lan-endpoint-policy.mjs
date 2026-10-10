// Opt-in dev-only LAN transport exception. IP allowlisting is routing control,
// NOT network isolation, authentication or authorization to execute HA tools.
export function inspectKitchenLanEndpoint(value,{networkRestrictionVerified=false,credentialScopeReviewed=false,ownerApprovedLanHttpPilot=false}={}){
 // Owner explicitly chose the limited HTTP LAN pilot with known transport risk.
 // This is NOT evidence of network segmentation or an HA-level scoped token.
 if(ownerApprovedLanHttpPilot!==true && (networkRestrictionVerified!==true||credentialScopeReviewed!==true))
  return {allowed:false,reason:'lan_acceptance_missing'};
 try{
  const u=new URL(value);
  if(u.protocol!=='http:'||u.hostname!=='192.168.31.94'||u.port!=='9584'||
     u.username||u.password||u.search||u.hash||!u.pathname.startsWith('/')||
     u.pathname.includes('..'))return {allowed:false,reason:'lan_endpoint_denied'};
  return {allowed:true,url:u};
 }catch{return {allowed:false,reason:'invalid_url'};}
}
