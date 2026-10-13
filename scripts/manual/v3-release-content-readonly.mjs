#!/usr/bin/env node
// Manual, non-mutating Gate D check of the pinned V3 source bytes and Git executable bits.
// Does not contact HA, Telegram, systemd or network. No tokens or file contents are printed.
import {verifyTrackedReleaseContent} from '../../src/ops/release-content-verify.mjs';

const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--readonly'||args[1]!=='--operator-approved'){
 console.error('USAGE: node scripts/manual/v3-release-content-readonly.mjs --readonly --operator-approved');
 process.exitCode=2;
}else{
 const r=verifyTrackedReleaseContent({
  repoDir:'/home/drpoh/projects/rs-home-ai-dev',
  releaseDir:'/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964',
  expectedPrefix:'9dd5964'
 });
 console.log('RELEASE_SOURCE_STATUS='+ (r.status==='pass'?'PASS':'UNVERIFIED'));
 console.log('RELEASE_DECLARED_COMMIT='+ (r.commit??'UNVERIFIED'));
 console.log('RELEASE_TRACKED_BYTES_MATCH='+ (r.contentMatch===true?'PASS':'UNVERIFIED'));
 console.log('RELEASE_EXECUTABLE_BITS_MATCH='+ (r.execModeMatch===true?'PASS':'UNVERIFIED'));
 console.log('RELEASE_CHECK_COUNTS='+JSON.stringify({
  tracked:r.tracked,checked:r.checked,missing:r.missing,
  modified:r.modified,typeMismatch:r.typeMismatch,
  execModeMismatch:r.execModeMismatch,unsupported:r.unsupported
 }));
 console.log('RELEASE_CHECK_REASON='+r.reason);
 for(const issue of r.issues)console.log('RELEASE_CHECK_ISSUE='+JSON.stringify(issue));
 console.log('RELEASE_UNTRACKED_FILES_AND_DEPENDENCIES_CHECKED=false');
 console.log('RELEASE_RUNTIME_PROCESS_ATTESTED=false');
 console.log('RELEASE_HA_WRITE_ATTEMPTED=false');
 process.exitCode=r.status==='pass'?0:1;
}
