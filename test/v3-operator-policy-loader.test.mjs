import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,symlinkSync,chmodSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
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
