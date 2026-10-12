import test from 'node:test';
import assert from 'node:assert/strict';
import {describeScopedLightIdentity} from '../src/home/light-inventory-identity.mjs';
const id='light.koridor_2';
test('identity evidence accepts exact scoped HA response but grants no authority',()=>{
 const r=describeScopedLightIdentity(id,{structuredContent:{data:{entity_id:id,state:'unavailable',attributes:{friendly_name:'Коридор основной'}}}});
 assert.equal(r.status,'unavailable');
 assert.match(r.text,/friendly_name="Коридор основной"/);
 assert.ok(!('authorization' in r));
});
test('identity evidence is fail-closed for mismatched entity, unsupported state or unknown id',()=>{
 assert.equal(describeScopedLightIdentity(id,{data:{entity_id:'light.other',state:'on'}}).status,'identity_mismatch');
 assert.equal(describeScopedLightIdentity(id,{data:{entity_id:id,state:'broken'}}).status,'invalid_state');
 assert.equal(describeScopedLightIdentity('switch.unknown',{data:{entity_id:'switch.unknown',state:'on'}}).status,'scope_denied');
 assert.equal(describeScopedLightIdentity(id,{isError:true}).status,'mcp_error');
});
test('friendly names stay bounded and do not inject lines',()=>{
 const r=describeScopedLightIdentity(id,{data:{entity_id:id,state:'off',attributes:{friendly_name:(String.fromCharCode(10)+'SECRET'+String.fromCharCode(9)).repeat(25)}}});
 assert.equal(r.text.split(String.fromCharCode(10)).length,1);
 assert.ok(r.text.length<180);
});
