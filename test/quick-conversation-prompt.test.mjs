import test from 'node:test';
import assert from 'node:assert/strict';
import {buildQuickConversationPrompt} from '../src/ai/quick-conversation-prompt.mjs';
test('quick greetings avoid extensive home instructions',()=>{
 const result=buildQuickConversationPrompt('Привет');
 assert.match(result,/Привет/);
 assert.match(result,/Не утверждай/);
 assert.ok(result.length<600);
});
