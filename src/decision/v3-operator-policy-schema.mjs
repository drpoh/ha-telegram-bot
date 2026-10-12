// Data validation only: approval and provenance must be checked by a separate
// protected operator-owned loader. Never accepts instructions from an LLM.
const ENTITY=/^light\.[a-z0-9_]+$/;
const SERVICES=new Set(["turn_on","turn_off"]);
export function validateV3OperatorPolicy(raw){
 if(!raw || typeof raw!=="object" || Array.isArray(raw) ||
    raw.version!==1 || raw.default!=="deny" ||
    !raw.entities || typeof raw.entities!=="object" ||
    Array.isArray(raw.entities) ||
    Object.keys(raw).some(k=>!["version","default","entities"].includes(k)))
  return {valid:false,reason:"invalid_policy_header"};
 const entities={};
 for(const [entityId,grant] of Object.entries(raw.entities)){
  if(!ENTITY.test(entityId) || !grant || typeof grant!=="object" ||
     Array.isArray(grant) || grant.level!=="confirm" ||
     !Array.isArray(grant.services) || grant.services.length<1 ||
     new Set(grant.services).size!==grant.services.length ||
     grant.services.some(s=>!SERVICES.has(s)) ||
     Object.keys(grant).some(k=>!["level","services"].includes(k)))
    return {valid:false,reason:"invalid_or_overbroad_grant"};
  entities[entityId]={level:"confirm",services:[...grant.services]};
 }
 return {valid:true,policy:{default:"deny",entities},status:"schema_valid_only_not_approved"};
}
