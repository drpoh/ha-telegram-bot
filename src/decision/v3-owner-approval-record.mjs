import {createHash,timingSafeEqual} from "node:crypto";

// Offline evidence only. A record alone cannot prove owner identity or grant actions.
// Trusted physical/local approval workflow and protected storage remain prerequisites.
const hex=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const equal=(a,b)=>hex(a)&&hex(b)&&timingSafeEqual(Buffer.from(a,"hex"),Buffer.from(b,"hex"));
export function inspectV3OwnerApproval({record,policySha256,registrySha256,now=Date.now()}={}){
 const deny=reason=>({valid:false,authorized:false,reason});
 if(!record||typeof record!=="object"||Array.isArray(record)||
    Object.keys(record).sort().join(",")!=="approvedAt,expiresAt,policySha256,registrySha256,version"||
    record.version!==1||!hex(record.policySha256)||!hex(record.registrySha256)||
    !Number.isSafeInteger(record.approvedAt)||!Number.isSafeInteger(record.expiresAt)||
    !Number.isSafeInteger(now)||record.approvedAt>now||record.expiresAt<=now||
    record.expiresAt<=record.approvedAt||record.expiresAt-record.approvedAt>86400000)
  return deny("invalid_or_expired_approval_record");
 if(!equal(record.policySha256,policySha256))return deny("policy_approval_revoked");
 if(!equal(record.registrySha256,registrySha256))return deny("registry_approval_revoked");
 const digest=createHash("sha256").update(JSON.stringify(record)).digest("hex");
 return {valid:true,authorized:false,reason:"owner_identity_and_protected_provenance_required",recordSha256:digest};
}
