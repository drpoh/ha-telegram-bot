import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const SHA='a'.repeat(40);
const script=new URL('../scripts/automation/stage-smoke.mjs',import.meta.url).pathname;
function run(args){
 return spawnSync(process.execPath,[script,...args],{encoding:'utf8',timeout:5000,env:{PATH:process.env.PATH||'/usr/bin',HOME:process.env.HOME||'/tmp'}});
}
test('offline stage smoke rejects missing, mismatched and incorrect candidates',()=>{
 assert.equal(run([]).status,1);
 const root=mkdtempSync(join(tmpdir(),'stage-candidate-'));
 try{
  const candidate=join(root,'rs-home-ai-v3-release-'+SHA.slice(0,7));
  mkdirSync(join(candidate,'src/ops'),{recursive:true});
  writeFileSync(join(candidate,'RELEASE_COMMIT'),'b'.repeat(40));
  copyFileSync(new URL('../src/ops/stage-mock-ha.mjs',import.meta.url),join(candidate,'src/ops/stage-mock-ha.mjs'));
  assert.match(run([candidate,SHA]).stderr,/STAGE_FAIL commit_mismatch/);
  writeFileSync(join(candidate,'RELEASE_COMMIT'),SHA+'\n');
  const passed=run([candidate,SHA]);
  assert.equal(passed.status,0,passed.stderr);
  assert.match(passed.stdout,/STAGE_PASS/);
  assert.match(passed.stdout,/mode=offline_mock/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
