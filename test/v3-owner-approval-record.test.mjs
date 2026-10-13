import test from "node:test";
import assert from "node:assert/strict";
import {inspectV3OwnerApproval} from "../src/decision/v3-owner-approval-record.mjs";
const now=1000000,p="a".repeat(64),r="b".repeat(64);
const record=()=>({version:1,policySha256:p,registrySha256:r,approvedAt:now-1000,expiresAt:now+60000});
const check=(rec=record(),policySha256=p,registrySha256=r)=>inspectV3OwnerApproval({record:rec,policySha256,registrySha256,now});
test("matching approval record is still never authorization",()=>{
 const res=check();assert.equal(res.valid,true);assert.equal(res.authorized,false);
 assert.equal(res.reason,"owner_identity_and_protected_provenance_required");
});
test("policy, registry mutation and expiry revoke the candidate",()=>{
 assert.equal(check(record(),"c".repeat(64)).reason,"policy_approval_revoked");
 assert.equal(check(record(),p,"c".repeat(64)).reason,"registry_approval_revoked");
 assert.equal(check({...record(),expiresAt:now}).valid,false);
 assert.equal(check({...record(),approvedAt:now+1}).valid,false);
 assert.equal(check({...record(),expiresAt:now+86400001}).valid,false);
 assert.equal(check({...record(),actor:"self_claimed"}).valid,false);
});
