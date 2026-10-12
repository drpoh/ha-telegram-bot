// Pure deployment environment contract. Never use a model-supplied environment
// to authorize a call. Runtime wiring must enforce this boundary separately.
const ENVIRONMENTS=new Set(['dev','stage','prod']);
const READ=new Set(['ha_get_state','ha_get_entity','ha_get_device','ha_search','ha_get_overview','ha_list_floors_areas']);
export function checkEnvironmentBoundary({environment,toolName,realHa=false,approvedProdDeployment=false}={}){
 const deny=reason=>({allowed:false,reason});
 if(!ENVIRONMENTS.has(environment))return deny('invalid_environment');
 if(typeof toolName!=='string'||!toolName)return deny('invalid_tool');
 if(environment==='dev')return deny('dev_fixture_only');
 if(environment==='stage'){
  if(!READ.has(toolName))return deny('stage_read_only');
  return realHa===true?deny('stage_real_ha_requires_separate_approval'):{allowed:true,mode:'mock_read_only'};
 }
 if(approvedProdDeployment!==true)return deny('prod_explicit_approval_required');
 if(READ.has(toolName))return {allowed:true,mode:'prod_read_only'};
 // Even in prod this contract NEVER directly grants an HA write.
 return deny('prod_write_requires_existing_policy_and_confirmation');
}
