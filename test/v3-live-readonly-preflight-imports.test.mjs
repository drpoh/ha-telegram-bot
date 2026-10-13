import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

test('live read-only preflight resolves imports without accessing live HA',()=>{
 const src=readFileSync(new URL('../scripts/manual/v3-live-readonly-preflight.mjs',import.meta.url),'utf8');
 assert.match(src,/from '\.\.\/\.\.\/src\/pilot\/kitchen-mcp-client\.mjs'/);
 assert.match(src,/from '\.\.\/\.\.\/src\/home\/sauna-status\.mjs'/);
 assert.match(src,/from '\.\.\/\.\.\/src\/home\/light-overview\.mjs'/);
 assert.match(src,/from '\.\.\/\.\.\/src\/home\/tambour-light-status\.mjs'/);
 assert.doesNotMatch(src,/ha_call_service/);
 const code="await import("+JSON.stringify(new URL('../src/pilot/kitchen-mcp-client.mjs',import.meta.url).href)+");await import("+JSON.stringify(new URL('../src/home/sauna-status.mjs',import.meta.url).href)+");";
 const result=spawnSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,result.stderr);
});
