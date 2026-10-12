import test from 'node:test';
import assert from 'node:assert/strict';
import {alertText,unsentEvents,eventId} from '../src/ops/gate-d-alerts.mjs';
const event={at:'2026-10-09T03:00:00Z',service:'v3',event:'unhealthy'};
test('Gate D alert: only fixed service and event labels',()=>{assert.match(alertText(event),/НЕ РАБОТАЕТ/);assert.match(alertText({...event,event:'recovered'}),/ВОССТАНОВЛЕН/);});
test('Gate D alert: reject unknown labels and malformed time',()=>{assert.throws(()=>alertText({...event,service:'token'}));assert.throws(()=>alertText({...event,at:'bad'}));});
test('Gate D alert: already delivered event does not replay',()=>{assert.equal(unsentEvents([event],new Set([eventId(event)])).length,0);assert.equal(unsentEvents([event],new Set()).length,1);});
