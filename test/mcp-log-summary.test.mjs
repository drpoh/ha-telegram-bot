import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeMcpRequest,summarizeMcpResponse} from '../src/mcp/log-summary.mjs';
test('request diagnostics do not include arguments',()=>{
 const output=JSON.stringify(summarizeMcpRequest('ha_get_state'));
 assert.equal(output.includes('token'),false);
 assert.deepEqual(JSON.parse(output),{tool:'ha_get_state'});
});
test('responses never emit entity identity, state or tokens',()=>{
 const body={structuredContent:{entities:[{entity_id:'light.secret',friendly_name:'Private room',state:'on',token:'SECRET_KEY'}]}};
 const output=JSON.stringify(summarizeMcpResponse('ha_search',body));
 assert.equal(output.includes('light.secret'),false);
 assert.equal(output.includes('Private room'),false);
 assert.equal(output.includes('SECRET_KEY'),false);
 assert.equal(output.includes('"on"'),false);
 assert.equal(JSON.parse(output).entityCount,1);
});
test('history metrics count records without revealing content',()=>{
 const r=summarizeMcpResponse('ha_get_history',{structuredContent:{data:{entities:[{entity_id:'sensor.sauna',states:[{state:'85',secret:'TOKEN'}]}]}}});
 assert.deepEqual(r,{tool:'ha_get_history',error:false,entityCount:1,recordCount:1});
});
test('malformed tool names cannot inject text into logs',()=>{
 assert.deepEqual(summarizeMcpRequest('ha_get_state\nSECRET'),{tool:'other'});
});
