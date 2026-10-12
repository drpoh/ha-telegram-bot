import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
test('Telegram new-light command must have exact-ID consent, /confirm and fail-closed dispatch',()=>{
 assert.match(source,/bot\.command\('newlight'/);
 assert.match(source,/newLightConsent\.request\(actor\(ctx\)/);
 assert.match(source,/newLightConsent\.confirm\(actor\(ctx\)\)/);
 assert.match(source,/newLightConsent\.cancel\(actor\(ctx\)\)/);
 assert.match(source,/createNewLightDispatch\(\{releaseEnabled:false,approvedIds:\[\]\}\)/);
 assert.match(source,/pilot\.cancel\(actor\(ctx\)\)/);
});
