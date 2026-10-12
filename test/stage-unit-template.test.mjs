import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const unit=readFileSync(new URL('../deploy/stage/rs-home-ai-stage.service.template',import.meta.url),'utf8');
test('Stage unit template cannot be accidentally installed with a real checkout path',()=>{
 assert.match(unit,/WorkingDirectory=__STAGE_RELEASE_DIR__/);
 assert.match(unit,/ExecStart=\/usr\/bin\/node __STAGE_RELEASE_DIR__\/scripts\/stage\/mock-server\.mjs/);
 assert.doesNotMatch(unit,/\/home\/drpoh|97343fa|EnvironmentFile=|TELEGRAM_BOT_TOKEN|MCP_URL/);
});
test('Stage template locks mock networking and suppresses privilege',()=>{
 for(const directive of ['NoNewPrivileges=true','ProtectSystem=strict','ProtectHome=read-only','IPAddressDeny=any','IPAddressAllow=localhost','UMask=0077','CapabilityBoundingSet='])assert.ok(unit.includes(directive),directive);
});
