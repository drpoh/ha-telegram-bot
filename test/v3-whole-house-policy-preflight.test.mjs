import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {preflightWholeHouseOffPolicy} from "../src/decision/v3-whole-house-policy-preflight.mjs";
test("pinned candidate never becomes an approved group policy by parsing",async()=>{
 const root=mkdtempSync(join(tmpdir(),"gateb-group-candidate-"));
 try{
  const filename="policy.json";
  const bytes=JSON.stringify({version:1,default:"deny",entities:{"light.ves_svet":{level:"confirm",services:["turn_off"]}}});
  writeFileSync(join(root,filename),bytes,{mode:0o600});
  const expectedSha256=createHash("sha256").update(bytes).digest("hex");
  const input={directory:root,filename,expectedSha256};
  const candidate=await preflightWholeHouseOffPolicy(input);
  assert.equal(candidate.ready,false);
  assert.equal(candidate.reason,"owner_approval_required");
  assert.equal(candidate.sha256,expectedSha256);
  assert.equal((await preflightWholeHouseOffPolicy({...input,expectedSha256:"0".repeat(64)})).ready,false);
  assert.equal((await preflightWholeHouseOffPolicy({directory:root,filename})).reason,"missing_pinned_digest");
  const broadened=JSON.stringify({version:1,default:"deny",entities:{"light.ves_svet":{level:"confirm",services:["turn_on","turn_off"]}}});
  writeFileSync(join(root,filename),broadened,{mode:0o600});
  const wide=await preflightWholeHouseOffPolicy({...input,expectedSha256:createHash("sha256").update(broadened).digest("hex")});
  assert.equal(wide.reason,"not_exact_whole_house_off");
 }finally{rmSync(root,{recursive:true,force:true});}
});
