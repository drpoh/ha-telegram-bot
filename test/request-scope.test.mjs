import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRequestScope } from '../src/decision/request-scope.mjs';
const kitchen = { entity_id: 'light.kukhnia_svet', domain: 'light', aliases: ['свет на кухне'] };
const living = { entity_id: 'light.podsvetka', domain: 'light', aliases: ['подсветку в гостиной'] };
const check = (userText, entity_id, devices = []) => checkRequestScope({userText,device:kitchen,devices,toolName:'ha_call_service',args:{domain:'light',entity_id}});
test('single known target cannot expand to another room', () => assert.equal(check('Выключи свет на кухне','light.liustra').allowed,false));
test('matching single target allowed', () => assert.equal(check('Выключи свет на кухне','light.kukhnia_svet').allowed,true));
test('ambiguous room grouping fails closed', () => assert.equal(check('Выключи свет на кухне и в гостиной','light.kukhnia_svet').status,'multi_target_unresolved'));
test('explicitly named pair permits only named entities', () => {
  const text='Выключи свет на кухне и подсветку в гостиной';
  assert.equal(check(text,'light.kukhnia_svet',[living]).allowed,true);
  assert.equal(check(text,'light.podsvetka',[living]).allowed,true);
  assert.equal(check(text,'light.liustra',[living]).allowed,false);
  assert.equal(check(text,['light.kukhnia_svet','light.liustra'],[living]).allowed,false);
});
test('read-only calls unaffected', () => assert.equal(checkRequestScope({userText:'Свет на кухне',device:kitchen,toolName:'ha_get_state',args:{entity_id:'light.liustra'}}).allowed,true));
