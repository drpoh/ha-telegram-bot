import test from 'node:test';
import assert from 'node:assert/strict';
import {checkV3ApprovalRevocation} from '../src/decision/v3-approval-revocation-guard.mjs';
const now=1000000,p='a'.repeat(64),r='b'.repeat(64);
const record=()=>({version:1,policySha256:p,registrySha256:r,approvedAt:now-1000,expiresAt:now+10000});
const run=(readApproval,policySha256=p,registrySha256=r)=>checkV3ApprovalRevocation({readApproval,policySha256,registrySha256,now,timeoutMs:20});
test('matching stored record remains non-authoritative',async()=>{
 const check=await run(({readOnly})=>{assert.equal(readOnly,true);return record()});
 assert.equal(check.valid,true);assert.equal(check.authorized,false);
});
test('revocation, expiry, absent storage and timeouts fail closed',async()=>{
 assert.equal((await run(()=>record(),'c'.repeat(64))).valid,false);
 assert.equal((await run(()=>record(),p,'c'.repeat(64))).valid,false);
 assert.equal((await run(()=>({...record(),expiresAt:now}))).valid,false);
 assert.equal((await run(()=>null)).valid,false);
 assert.equal((await run(()=>{throw Error('offline')})).reason,'approval_read_failed');
 assert.equal((await run(()=>new Promise(()=>{}))).reason,'approval_read_failed');
});
