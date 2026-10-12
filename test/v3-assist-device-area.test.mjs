import test from 'node:test';import assert from 'node:assert/strict';import{verifyAssistDeviceArea}from '../src/decision/v3-assist-device-area.mjs';
const entityId='light.fixture';const e={entity_id:entityId,device_id:'device1',unique_id:'stable',enabled:true,disabled_by:null,hidden:false,hidden_by:null,area_id:null};
const entityResponse={success:true,entity_id:entityId,entity_entry:e};const deviceResponse={success:true,device:{device_id:'device1',area_id:'sauna',disabled_by:null}};
const check=(patch={})=>verifyAssistDeviceArea({entityResponse,deviceResponse,entityId,expectedAreaId:'sauna',...patch});
test('inherited room matches precise device link, not authorization',()=>{const r=check();assert.equal(r.verified,true);assert.equal(r.status,'registry_binding_only');});
test('wrong linked device or room is blocked',()=>{assert.equal(check({deviceResponse:{success:true,device:{device_id:'other',area_id:'sauna'}}}).verified,false);assert.equal(check({expectedAreaId:'kitchen'}).verified,false);});
test('conflicting entity/device areas blocked',()=>assert.equal(check({entityResponse:{...entityResponse,entity_entry:{...e,area_id:'kitchen'}}}).verified,false));
test('disabled or incomplete registry evidence blocked',()=>{assert.equal(check({entityResponse:{...entityResponse,entity_entry:{...e,enabled:false}}}).verified,false);assert.equal(check({deviceResponse:{success:false}}).verified,false);});
