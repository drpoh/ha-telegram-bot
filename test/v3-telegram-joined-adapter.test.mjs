import test from 'node:test';
import assert from 'node:assert/strict';
import {createIsolatedV3JoinedChain} from '../src/decision/v3-isolated-joined-chain.mjs';
import {createV3TelegramJoinedAdapter} from '../src/decision/v3-telegram-joined-adapter.mjs';
const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.fixture'}};
const ctx=()=>({update:{update_id:101},from:{id:55},chat:{id:55,type:'private'},message:{message_id:4,from:{id:55},chat:{id:55},date:1000,text:'Включи весь свет в Комната'}});
test('joined adapter denies spoofing and replay before issuing consent',()=>{
 const chain=createIsolatedV3JoinedChain({telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),clock:()=>1000000,policy:{},configPath:'/none',readTool:async()=>{throw Error('unexpected read')},simulateWrite:async()=>{throw Error('unexpected write')}});
 const bad=ctx();bad.message.from.id=77;
 assert.equal(chain.issueFromTransport({ctx:bad,action}).status,'denied');
 assert.equal(chain.issue({ctx:ctx(),action}).status,'denied');
 const pending=chain.issueFromTransport({ctx:ctx(),action});
 assert.equal(pending.status,'pending');
 assert.equal(chain.issueFromTransport({ctx:ctx(),action}).reason,'duplicate_transport_message');
 assert.equal(chain.cancel({userId:55,chatId:55}),true);
 assert.equal(chain.cancel({userId:55,chatId:55}),false);
});
test('joined adapter declines stale and group chat messages',()=>{
 const chain=createIsolatedV3JoinedChain({telegramIngress:createV3TelegramJoinedAdapter({allowedUserId:55,clock:()=>1000000}),clock:()=>1000000,policy:{},configPath:'/none',readTool:async()=>{throw Error('unexpected read')},simulateWrite:async()=>{throw Error('unexpected write')}});
 const group=ctx();group.chat.type='group';assert.equal(chain.issueFromTransport({ctx:group,action}).status,'denied');
 const stale=ctx();stale.message.date=900;assert.equal(chain.issueFromTransport({ctx:stale,action}).status,'denied');
});
