import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('DEV automation has no production service calls or HA tool invocations',()=>{
 const script=load('scripts/automation/dev-validate.sh');
 assert.match(script,/git merge --ff-only/);
 assert.match(script,/npm test/);
 assert.match(script,/prepare-v3-release-candidate\.sh/);
 assert.match(script,/flock -n/);
 assert.match(script,/RS_V3_CANDIDATE_ROOT/);
 assert.doesNotMatch(script,/systemctl|ha_call_service|git reset --hard|git push|rs-home-ai-v3\.service/);
});
test('systemd job read-write scope excludes production and secrets',()=>{
 const unit=load('deploy/rs-home-ai-dev-check.service');
 assert.match(unit,/ProtectSystem=strict/);
 assert.match(unit,/ProtectHome=read-only/);
 assert.match(unit,/NoNewPrivileges=yes/);
 const write=unit.match(/^ReadWritePaths=(.*)$/m)?.[1]??'';
 assert.match(write,/rs-home-ai-dev/);
 assert.match(write,/rs-home-ai-v3-candidates/);
 assert.doesNotMatch(write,/rs-home-ai-v3-release-|%h\/projects(?:\s|$)|ha-telegram-bot/);
 assert.match(unit,/InaccessiblePaths=.*rs-home-ai-v3/);
});
test('installer cannot silently overwrite a differing user unit',()=>{
 const installer=load('scripts/automation/install-dev-check.sh');
 assert.match(installer,/cmp -s/);
 assert.match(installer,/DENY: differing installed/);
 assert.match(installer,/enable --now rs-home-ai-dev-check\.timer/);
 assert.doesNotMatch(installer,/systemctl --user restart|rs-home-ai-v3\.service/);
});

test('SSH failures are classified without showing raw remote errors',()=>{
 const script=load('scripts/automation/dev-validate.sh');
 assert.match(script,/ssh_publickey_denied/);
 assert.match(script,/ssh_host_key_untrusted/);
 assert.match(script,/ssh_agent_unavailable/);
 assert.match(script,/fetch-reason\.txt/);
 assert.match(script,/2>"\$fetch_errors"/);
 assert.doesNotMatch(script,/cat "\$fetch_errors"|tee "\$fetch_errors"/);
});

test('DEV SSH bypasses faulty global proxy config but still verifies host keys',()=>{
 const script=load('scripts/automation/dev-validate.sh');
 assert.match(script,/GIT_SSH_COMMAND="\/usr\/bin\/ssh -F none/);
 assert.match(script,/StrictHostKeyChecking=yes/);
 assert.match(script,/BatchMode=yes/);
 assert.doesNotMatch(script,/StrictHostKeyChecking=no|UserKnownHostsFile=\/dev\/null/);
});
