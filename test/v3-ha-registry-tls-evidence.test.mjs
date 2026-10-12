import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRegistryTlsPeer} from '../src/decision/v3-ha-registry-tls-evidence.mjs';
const expectedFingerprint256='a'.repeat(64);
const sample={expectedHostname:'ha.example.invalid',expectedFingerprint256,peer:{authorized:true,hostname:'ha.example.invalid',fingerprint256:expectedFingerprint256}};
test('matching mock peer evidence is never HA action authorization',()=>{
 const r=assessRegistryTlsPeer(sample);assert.equal(r.verified,true);assert.equal(r.authorization,false);
});
test('untrusted certificate, hostname and pin changes deny',()=>{
 for(const change of [{peer:{...sample.peer,authorized:false}},{peer:{...sample.peer,hostname:'other.example.invalid'}},
  {peer:{...sample.peer,fingerprint256:'b'.repeat(64)}},{expectedFingerprint256:'bad'},
  {expectedHostname:'localhost'},{peer:null}]){
  const r=assessRegistryTlsPeer({...sample,...change});assert.equal(r.verified,false);assert.equal(r.authorization,false);
 }
});
