import {readV3PolicyFile} from "./v3-operator-policy-loader.mjs";

// Offline preflight only: digest-pinned policy is data, not owner approval.
export async function preflightWholeHouseOffPolicy({directory,filename,expectedSha256}={}){
 const deny=reason=>({ready:false,reason,policy:null});
 if(typeof expectedSha256!=="string" || !/^[a-f0-9]{64}$/.test(expectedSha256))
  return deny("missing_pinned_digest");
 const loaded=await readV3PolicyFile({directory,filename,expectedSha256});
 if(!loaded.ok)return deny(loaded.reason);
 const keys=Object.keys(loaded.policy.entities);
 const grant=loaded.policy.entities["light.ves_svet"];
 if(keys.length!==1 || keys[0]!=="light.ves_svet" ||
    grant?.level!=="confirm" || grant.services.length!==1 ||
    grant.services[0]!=="turn_off")
  return deny("not_exact_whole_house_off");
 return {ready:false,reason:"owner_approval_required",sha256:loaded.sha256,
  parsedPolicy:loaded.policy,status:"candidate_only_never_authorizes"};
}
