import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chmodSync,copyFileSync,mkdirSync,mkdtempSync,readlinkSync,rmSync,symlinkSync,unlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename,join} from 'node:path';
import {verifyTrackedReleaseContent} from '../src/ops/release-content-verify.mjs';

function makeFixture({executable=false,withLink=false}={}){
 const root=mkdtempSync(join(tmpdir(),'rs-release-content-'));
 const repoDir=join(root,'dev');
 mkdirSync(repoDir);
 const source=join(repoDir,'index.mjs');
 writeFileSync(source,'export const answer=42;\n');
 chmodSync(source,executable?0o755:0o644);
 if(withLink)symlinkSync('index.mjs',join(repoDir,'entry-link'));
 const git=(...args)=>execFileSync('git',['-C',repoDir,...args],{encoding:'utf8',timeout:12000}).trim();
 git('init','-q');
 git('add','.');
 git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-q','-m','fixture');
 const sha=git('rev-parse','HEAD');
 const releaseDir=join(root,'rs-home-ai-v3-release-'+sha.slice(0,7));
 mkdirSync(releaseDir);
 copyFileSync(source,join(releaseDir,'index.mjs'));
 chmodSync(join(releaseDir,'index.mjs'),0o644);
 if(withLink)symlinkSync(readlinkSync(join(repoDir,'entry-link')),join(releaseDir,'entry-link'));
 writeFileSync(join(releaseDir,'RELEASE_COMMIT'),sha+'\n');
 return {root,repoDir,releaseDir,sha,params:{
  repoDir,releaseDir,expectedPrefix:sha.slice(0,7)
 }};
}

test('release check compares Git bytes despite tar mode/uid/gid metadata differences',()=>{
 const fx=makeFixture({withLink:true});
 try{
  chmodSync(join(fx.releaseDir,'index.mjs'),0o600); // Git expects 0644; non-exec metadata change is harmless to byte proof.
  const r=verifyTrackedReleaseContent(fx.params);
  assert.equal(r.status,'pass');
  assert.equal(r.contentMatch,true);
  assert.equal(r.execModeMatch,true);
  assert.equal(r.checked,2);assert.equal(r.modified,0);assert.equal(r.missing,0);
  assert.equal(r.commit,fx.sha);
 }finally{rmSync(fx.root,{recursive:true,force:true});}
});

test('missing and modified source files block source match without showing contents',()=>{
 const fx=makeFixture({withLink:true});
 try{
  writeFileSync(join(fx.releaseDir,'index.mjs'),'export const answer="a_private_value";\n');
  unlinkSync(join(fx.releaseDir,'entry-link'));
  const r=verifyTrackedReleaseContent(fx.params);
  assert.equal(r.status,'unverified');assert.equal(r.contentMatch,false);
  assert.equal(r.modified,1);assert.equal(r.missing,1);
  assert.equal(JSON.stringify(r).includes('a_private_value'),false);
  assert.equal(r.issues.some(x=>x.reason==='content_differs'),true);
 }finally{rmSync(fx.root,{recursive:true,force:true});}
});

test('only executable-bit change is flagged separately even when every tracked byte matches',()=>{
 const fx=makeFixture({executable:true});
 try{
  const diff=verifyTrackedReleaseContent(fx.params);
  assert.equal(diff.contentMatch,true);
  assert.equal(diff.execModeMatch,false);
  assert.equal(diff.execModeMismatch,1);
  assert.equal(diff.status,'unverified');
  chmodSync(join(fx.releaseDir,'index.mjs'),0o755);
  const same=verifyTrackedReleaseContent(fx.params);
  assert.equal(same.status,'pass');assert.equal(same.execModeMismatch,0);
 }finally{rmSync(fx.root,{recursive:true,force:true});}
});

test('mismatched release marker or symlinked root fail closed',()=>{
 const fx=makeFixture();
 try{
  writeFileSync(join(fx.releaseDir,'RELEASE_COMMIT'),'not_a_commit\n');
  const invalid=verifyTrackedReleaseContent(fx.params);
  assert.equal(invalid.status,'unverified');
  assert.equal(invalid.reason,'release_marker_mismatch');
  const link=join(fx.root,'rs-home-ai-v3-release-'+fx.sha.slice(0,7)+'-link');
  symlinkSync(fx.releaseDir,link,'dir');
  const linked=verifyTrackedReleaseContent({
   ...fx.params,releaseDir:link
  });
  assert.equal(linked.status,'unverified');
  assert.equal(linked.reason,'invalid_root');
 }finally{rmSync(fx.root,{recursive:true,force:true});}
});

test('missing git objects or unsafe directory links fail closed without reading target file',()=>{
 const fx=makeFixture();
 try{
  const external=join(fx.root,'external-file');
  writeFileSync(external,'sensitive-fixture-data');
  unlinkSync(join(fx.releaseDir,'index.mjs'));
  symlinkSync(external,join(fx.releaseDir,'index.mjs'));
  const result=verifyTrackedReleaseContent(fx.params);
  assert.equal(result.status,'unverified');
  assert.equal(result.typeMismatch,1);
  assert.equal(JSON.stringify(result).includes('sensitive-fixture-data'),false);
  // Remove the source Git objects, not a device or live file.
  rmSync(join(fx.repoDir,'.git'),{recursive:true,force:true});
  const noGit=verifyTrackedReleaseContent(fx.params);
  assert.equal(noGit.status,'unverified');
  assert.equal(noGit.reason,'read_failed');
 }finally{rmSync(fx.root,{recursive:true,force:true});}
});
