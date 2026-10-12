import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEnvironmentIsolation} from '../src/ops/environment-isolation.mjs';
const example=new URL('../config/environments/isolation.example.json',import.meta.url);
test('stage planning manifest stays disjoint, mock-only and without writes',()=>{
 const entries=JSON.parse(readFileSync(example,'utf8'));
 assert.equal(validateEnvironmentIsolation(entries).status,'offline_manifest_validated_only');
 for(const env of entries)assert.equal(env.writeEnabled,false);
 assert.equal(entries.find(x=>x.environment==='stage').haAccess,'mock');
 assert.equal(entries.find(x=>x.environment==='dev').haAccess,'fixture');
 assert.equal(entries.find(x=>x.environment==='prod').haEndpointRef,'future-owner-reviewed-endpoint');
});
