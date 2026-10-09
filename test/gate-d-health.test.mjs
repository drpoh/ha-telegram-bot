import test from 'node:test';
import assert from 'node:assert/strict';
import {parseUnit,evaluateHealth} from '../src/ops/gate-d-health.mjs';
const up=parseUnit('ActiveState=active\nUnitFileState=enabled\nMainPID=42\nNRestarts=1');
test('Gate D: active supervised service is healthy',()=>{assert.equal(evaluateHealth([up]),true);assert.equal(up.restarts,1);});
test('Gate D: inactive service fails closed',()=>assert.equal(evaluateHealth([{...up,active:false}]),false));
test('Gate D: disabled service fails closed',()=>assert.equal(evaluateHealth([{...up,enabled:false}]),false));
test('Gate D: missing process fails closed',()=>assert.equal(evaluateHealth([{...up,pid:0}]),false));
test('Gate D: missing properties do not pass',()=>assert.equal(evaluateHealth([parseUnit('ActiveState=active')]),false));
