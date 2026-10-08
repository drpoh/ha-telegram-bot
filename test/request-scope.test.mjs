import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRequestScope } from '../src/decision/request-scope.mjs';
const device = { entity_id: 'light.kukhnia_svet', domain: 'light' };
test('single known target cannot expand to another room', () => {
  assert.equal(checkRequestScope({userText:'Выключи свет на кухне',device,toolName:'ha_call_service',args:{domain:'light',entity_id:'light.liustra'}}).allowed,false);
});
test('matching single target allowed', () => {
  assert.equal(checkRequestScope({userText:'Выключи свет на кухне',device,toolName:'ha_call_service',args:{domain:'light',entity_id:'light.kukhnia_svet'}}).allowed,true);
});
test('ambiguous multi-target request fails closed', () => {
  const result = checkRequestScope({userText:'Выключи свет на кухне и в коридоре',device,toolName:'ha_call_service',args:{domain:'light',entity_id:'light.koridor'}});
  assert.equal(result.status,'multi_target_unresolved');
  assert.equal(result.allowed,false);
});
test('read-only calls unaffected', () => {
  assert.equal(checkRequestScope({userText:'Свет на кухне',device,toolName:'ha_get_state',args:{entity_id:'light.liustra'}}).allowed,true);
});
