import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
test('single light diagnostic uses only reviewed read-only HA state request',()=>{
 assert.match(source,/bot\.command\('lightcheck',async ctx=>\{/);
 assert.match(source,/entityId:parts\[1\]/);
 assert.match(source,/readState:id=>newLightRead\(id\)/);
 assert.match(source,/inspectSingleNewLight\(/);
 assert.match(source,/if\(!allow\(ctx\)\)return;/);
 assert.match(source,/createNewLightDispatch\(\{releaseEnabled:false,approvedIds:\[\]\}\)/);
});
