import {acquireLightingEvidence} from "./v3-registry-evidence-reader.mjs";
import {readV3PolicyFile} from "./v3-operator-policy-loader.mjs";

// Offline verification of independently pinned inputs, NOT a grant or writer.
export async function preflightV3EvidenceBundle({
 registryReader,registrySha256,policyDirectory,policyFilename,policySha256,
 now=Date.now()
}={}){
 const deny=(reason)=>({ready:false,authorized:false,reason});
 if(!/^[0-9a-f]{64}$/.test(registrySha256||"")||
    !/^[0-9a-f]{64}$/.test(policySha256||""))
  return deny("missing_independent_pins");
 const [registry,policy]=await Promise.all([
  acquireLightingEvidence({reader:registryReader,expectedSha256:registrySha256,now}),
  readV3PolicyFile({directory:policyDirectory,filename:policyFilename,expectedSha256:policySha256})
 ]);
 if(registry.reason!=="owner_and_transport_approval_required")
  return deny("registry_"+(registry.reason||"unverified"));
 if(!policy.ok)return deny("policy_"+policy.reason);
 if(policy.status!=="parsed_not_operator_approved")return deny("invalid_policy_status");
 // No policy can turn these checks into an approval; an independently protected
 // consent/actor record, HA provenance and trusted transport remain mandatory.
 return {ready:false,authorized:false,reason:"independent_owner_approval_and_transport_required",
  registrySha256:registry.sha256,policySha256:policy.sha256};
}
