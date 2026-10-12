import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeV3Command,mayRequestV3Action} from '../src/decision/v3-command-envelope.mjs';
import {createV3ChannelIntentLedger} from '../src/decision/v3-channel-intent-ledger.mjs';
import {checkV3ToolBoundary} from '../src/decision/v3-tool-boundary.mjs';

const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.fixture'}};
const assist=()=>normalizeV3Command({source:'assist',sourceId:'atom.fixture',text:'Включи свет',issuedAt:100});

test('offline Assist device provenance never becomes a human identity or permission',()=>{
 const v=assist();assert.equal(v.accepted,true);
 assert.equal(v.command.actorId,null);
 assert.equal(v.command.assurance,'device_only');
 assert.equal(mayRequestV3Action(v.command,{risk:'high'}),false);
 assert.equal(mayRequestV3Action(v.command,{requiresPersonalIdentity:true}),false);
 assert.equal(normalizeV3Command({source:'assist',sourceId:'atom.fixture',actorId:55,authenticated:true,text:'Включи',issuedAt:100}).accepted,false);
 const ledger=createV3ChannelIntentLedger({clock:()=>1000});
 const issued=ledger.propose({command:v.command,action});
 assert.equal(ledger.consume({command:{...v.command,sourceId:'atom.other'},token:issued.token}),null);
 assert.equal(ledger.consume({command:{...v.command,assurance:'authenticated_transport',actorId:55},token:issued.token}),null);
 assert.equal(ledger.consume({command:v.command,token:issued.token})?.action.args.entity_id,'light.fixture');
 assert.equal(ledger.consume({command:v.command,token:issued.token}),null);
});

test('mock Telegram provenance binds original request and rejects unknown MCP mutations',()=>{
 const verified=normalizeV3Command({source:'telegram',sourceId:'chat.fixture',actorId:55,authenticated:true,text:'Включи свет',issuedAt:100});
 assert.equal(verified.accepted,true);
 assert.equal(normalizeV3Command({source:'telegram',sourceId:'chat.fixture',actorId:55,text:'Включи свет',issuedAt:100}).accepted,false);
 const ledger=createV3ChannelIntentLedger({clock:()=>1000});
 const {token}=ledger.propose({command:verified.command,action});
 assert.equal(ledger.consume({command:{...verified.command,actorId:56},token}),null);
 assert.equal(ledger.consume({command:{...verified.command,originalText:'Выключи свет'},token}),null);
 assert.equal(checkV3ToolBoundary({name:'ha_config_set_automation',args:{}}).allowed,false);
 assert.equal(checkV3ToolBoundary({name:'ha_call_service',args:{domain:'homeassistant',service:'restart',entity_id:'light.fixture'}}).allowed,false);
 assert.deepEqual(ledger.consume({command:verified.command,token}).action,action);
 assert.equal(ledger.consume({command:verified.command,token}),null);
});
