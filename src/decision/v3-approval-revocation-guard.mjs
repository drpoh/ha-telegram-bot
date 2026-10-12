import {inspectV3OwnerApproval} from './v3-owner-approval-record.mjs';

// Test-only, fail-closed check against a separately provided local approval reader.
// Neither this reader nor JSON can establish an authenticated owner approval.
export async function checkV3ApprovalRevocation({readApproval,policySha256,registrySha256,now=Date.now(),timeoutMs=1500}={}){
 const deny=reason=>({valid:false,authorized:false,reason});
 if(typeof readApproval!=='function'||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)return deny('invalid_approval_reader');
 let timer;
 try{
  const record=await Promise.race([
   Promise.resolve().then(()=>readApproval({readOnly:true})),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),timeoutMs);})
  ]);
  const checked=inspectV3OwnerApproval({record,policySha256,registrySha256,now});
  if(!checked.valid)return deny(checked.reason);
  return {valid:true,authorized:false,reason:'independent_owner_authentication_required',recordSha256:checked.recordSha256};
 }catch{return deny('approval_read_failed');}
 finally{if(timer!==undefined)clearTimeout(timer);}
}
