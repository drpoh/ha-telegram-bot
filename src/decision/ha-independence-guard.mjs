// Pure v3 boundary: optional AI client must not control HA lifecycle.
// Fail closed even when a model or caller declares an action safe.
const forbiddenDomains=new Set(["homeassistant","hassio","supervisor"]);
const forbiddenServices=new Set([
 "automation.reload","script.reload","scene.reload","group.reload",
 "config.reload","mqtt.reload","persistent_notification.dismiss",
]);
export function checkHaIndependence({name,args}={}){
 if(name!=="ha_call_service")return {allowed:true,status:"not_service"};
 const domain=typeof args?.domain==="string"?args.domain.toLowerCase():"";
 const service=typeof args?.service==="string"?args.service.toLowerCase():"";
 if(!/^[a-z_]+$/.test(domain)||!/^[a-z_]+$/.test(service))
  return {allowed:false,status:"invalid_service"};
 if(forbiddenDomains.has(domain)||forbiddenServices.has(domain+"."+service) ||
    service==="restart"||service==="stop"||service==="shutdown"||service==="reload")
  return {allowed:false,status:"ha_lifecycle_forbidden"};
 return {allowed:true,status:"no_lifecycle_risk_detected"};
}
