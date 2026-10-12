import {createHash,timingSafeEqual} from 'node:crypto';

// Offline anti-rollback verification. The trusted monotonic checkpoint must
// be stored separately and protected from the same attacker as the candidate.
// A caller-provided checkpoint is NOT proof of authenticity.
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export function inspectApprovalRollback({candidate,checkpoint}={}){
 const deny=reason=>({valid:false,authorized:false,reason});
 if(!candidate||!checkpoint||typeof candidate!=='object'||typeof checkpoint!=='object'||
    Object.keys(candidate).sort().join(',')!=='record,revision'||
    Object.keys(checkpoint).sort().join(',')!=='recordSha256,revision'||
    !Number.isSafeInteger(candidate.revision)||candidate.revision<1||
    !Number.isSafeInteger(checkpoint.revision)||checkpoint.revision<1||
    !hex(checkpoint.recordSha256))
  return deny('invalid_rollback_evidence');
 if(!candidate.record||typeof candidate.record!=='object'||Array.isArray(candidate.record)||Object.keys(candidate.record).length===0)
  return deny('invalid_rollback_evidence');
 if(candidate.revision!==checkpoint.revision)return deny(candidate.revision<checkpoint.revision?'rollback_detected':'unreviewed_new_revision');
 const observed=digest(candidate.record);
 if(!timingSafeEqual(Buffer.from(observed,'hex'),Buffer.from(checkpoint.recordSha256,'hex')))
  return deny('record_replaced');
 return {valid:true,authorized:false,reason:'independent_checkpoint_provenance_required',revision:candidate.revision};
}
