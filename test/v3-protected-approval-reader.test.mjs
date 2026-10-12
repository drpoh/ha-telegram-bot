import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,symlinkSync,chmodSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {readProtectedApprovalCandidate} from '../src/decision/v3-protected-approval-reader.mjs';
test('private local candidate can be read but never grants authority',async()=>{
 const root=mkdtempSync(join(tmpdir(),'approval-private-'));chmodSync(root,0o700);
 try{
  const path=join(root,'approval-gateb.json');writeFileSync(path,'{"version":1}',{mode:0o600});
  const checked=await readProtectedApprovalCandidate({path});assert.equal(checked.ok,true);assert.equal(checked.authorization,false);
  chmodSync(path,0o644);assert.equal((await readProtectedApprovalCandidate({path})).reason,'unsafe_record');
  rmSync(path);symlinkSync('/etc/hosts',path);assert.equal((await readProtectedApprovalCandidate({path})).ok,false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('unsafe directory and absent path deny',async()=>{
 const root=mkdtempSync(join(tmpdir(),'approval-private-'));
 try{
  const path=join(root,'approval-gateb.json');chmodSync(root,0o755);
  assert.equal((await readProtectedApprovalCandidate({path})).reason,'unsafe_directory');
  assert.equal((await readProtectedApprovalCandidate({path:'/tmp/whatever.json'})).reason,'invalid_path');
 }finally{rmSync(root,{recursive:true,force:true});}
});
