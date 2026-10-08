import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,symlinkSync,chmodSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {createHash} from "node:crypto";
import {join} from "node:path";
import {readV3PolicyFile} from "../src/decision/v3-operator-policy-loader.mjs";
test("local v3 policy loads as parsed but not authorized",async()=>{
 const root=mkdtempSync(join(tmpdir(),"v3-policy-"));
 try{
  const path=join(root,"policy.json");
  writeFileSync(path,JSON.stringify({version:1,default:"deny",entities:{"light.fixture":{level:"confirm",services:["turn_on"]}}}),{mode:0o600});
  const r=await readV3PolicyFile({directory:root,filename:"policy.json"});
  assert.equal(r.ok,true);
  assert.equal(r.status,"parsed_not_operator_approved");
  assert.equal(r.policy.entities["light.fixture"].level,"confirm");
 }finally{rmSync(root,{recursive:true,force:true});}
});
test("local policy rejects invalid location symlink and writable grants",async()=>{
 const root=mkdtempSync(join(tmpdir(),"v3-policy-"));
 try{
  writeFileSync(join(root,"policy.json"),JSON.stringify({version:1,default:"deny",entities:{}}),{mode:0o600});
  assert.equal((await readV3PolicyFile({directory:root,filename:"../policy.json"})).ok,false);
  symlinkSync(join(root,"policy.json"),join(root,"link.json"));
  assert.equal((await readV3PolicyFile({directory:root,filename:"link.json"})).ok,false);
  chmodSync(join(root,"policy.json"),0o666);
  assert.equal((await readV3PolicyFile({directory:root,filename:"policy.json"})).ok,false);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test("reject group/world writable policy directory and recover after securing it",async()=>{
 const root=mkdtempSync(join(tmpdir(),"v3-policy-"));
 try{
  writeFileSync(join(root,"policy.json"),JSON.stringify({version:1,default:"deny",entities:{}}),{mode:0o600});
  chmodSync(root,0o777);
  const rejected=await readV3PolicyFile({directory:root,filename:"policy.json"});
  assert.equal(rejected.ok,false);
  assert.equal(rejected.reason,"unsafe_directory");
  chmodSync(root,0o700);
  assert.equal((await readV3PolicyFile({directory:root,filename:"policy.json"})).ok,true);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test("reject symlinked policy directory and oversized policy",async()=>{
 const root=mkdtempSync(join(tmpdir(),"v3-policy-"));
 const link=root+"-link";
 try{
  symlinkSync(root,link);
  writeFileSync(join(root,"policy.json"),JSON.stringify({version:1,default:"deny",entities:{}}),{mode:0o600});
  assert.equal((await readV3PolicyFile({directory:link,filename:"policy.json"})).ok,false);
  writeFileSync(join(root,"policy.json"),"x".repeat(65537),{mode:0o600});
  assert.equal((await readV3PolicyFile({directory:root,filename:"policy.json"})).ok,false);
 }finally{rmSync(link,{force:true});rmSync(root,{recursive:true,force:true});}
});

test("policy content digest pins exact file bytes but never authorizes",async()=>{
 const root=mkdtempSync(join(tmpdir(),"v3-policy-"));
 const bytes=JSON.stringify({version:1,default:"deny",entities:{}});
 try{
  writeFileSync(join(root,"policy.json"),bytes,{mode:0o600});
  const hash=createHash("sha256").update(bytes).digest("hex");
  const ok=await readV3PolicyFile({directory:root,filename:"policy.json",expectedSha256:hash});
  assert.equal(ok.ok,true);
  assert.equal(ok.sha256,hash);
  assert.equal(ok.status,"parsed_not_operator_approved");
  assert.equal((await readV3PolicyFile({directory:root,filename:"policy.json",expectedSha256:"0".repeat(64)})).reason,"digest_mismatch");
  assert.equal((await readV3PolicyFile({directory:root,filename:"policy.json",expectedSha256:"BAD"})).reason,"invalid_digest");
  writeFileSync(join(root,"policy.json"),bytes+" ",{mode:0o600});
  assert.equal((await readV3PolicyFile({directory:root,filename:"policy.json",expectedSha256:hash})).reason,"digest_mismatch");
 }finally{rmSync(root,{recursive:true,force:true});}
});
