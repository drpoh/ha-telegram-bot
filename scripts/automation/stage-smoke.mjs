#!/usr/bin/env node
// Disposable offline STAGE smoke. No persistent service, Telegram, or HA-MCP.
import {readFileSync,existsSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,join,basename} from 'node:path';
import {pathToFileURL} from 'node:url';

const fail=(reason)=>{console.error('STAGE_FAIL '+reason);process.exitCode=1;};
const [candidateArg,expectedSha]=process.argv.slice(2);
const shaPattern=/^[a-f0-9]{40}$/;
if(!shaPattern.test(expectedSha||'') || !candidateArg?.startsWith('/')){fail('invalid_args');}
else {
 try {
  const candidate=resolve(candidateArg);
  const expectedName='rs-home-ai-v3-release-'+expectedSha.slice(0,7);
  if(basename(candidate)!==expectedName || lstatSync(candidate).isSymbolicLink() ||
     !lstatSync(candidate).isDirectory() || realpathSync(candidate)!==candidate) throw Error('candidate_identity');
  const marker=join(candidate,'RELEASE_COMMIT');
  if(lstatSync(marker).isSymbolicLink() || readFileSync(marker,'utf8').trim()!==expectedSha) throw Error('commit_mismatch');
  const mockFile=join(candidate,'src/ops/stage-mock-ha.mjs');
  if(!existsSync(mockFile)||lstatSync(mockFile).isSymbolicLink()) throw Error('mock_missing');
  const {createStageMockHa}=await import(pathToFileURL(mockFile).href);
  if(typeof createStageMockHa!=='function')throw Error('mock_invalid');
  const stage=createStageMockHa();
  const address=await stage.start();
  try {
   if(address.address!=='127.0.0.1')throw Error('not_loopback');
   const base='http://127.0.0.1:'+address.port;
   const request=async(path,options={})=>fetch(base+path,{...options,signal:AbortSignal.timeout(2500),redirect:'error'});
   const health=await (await request('/health')).json();
   if(health.ok!==true||health.environment!=='stage'||health.mode!=='mock'||health.haWrites!==false)
    throw Error('health_invariant');
   const registry=await (await request('/registry')).json();
   if(registry.environment!=='stage'||registry.mode!=='mock'||registry.authorization!==false||
      registry.complete!==true||registry.partial!==false||!Array.isArray(registry.entities)||registry.entities.length!==0)
    throw Error('registry_invariant');
   for(const [method,path] of [['POST','/services/light/turn_on'],['GET','/api/states'],['POST','/registry']]){
    const response=await request(path,{method});
    if(response.status!==403)throw Error('write_boundary');
   }
   console.log('STAGE_PASS sha='+expectedSha+' mode=offline_mock tests=identity,health,registry,deny');
  } finally {await stage.close();}
 }catch(error){fail(error?.message||'stage_exception');}
}
