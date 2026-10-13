import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('/memory is private and summary only',()=>{
 const src=readFileSync(new URL('../src/telegram/bot.mjs',import.meta.url),'utf8');
 const start=src.indexOf('bot.command("memory"');
 const end=src.indexOf('bot.command("clear"',start);
 assert.ok(start>0&&end>start);
 const body=src.slice(start,end);
 assert.match(body,/isAllowed\(ctx\)/);
 assert.match(body,/ctx\.chat\?\.type !== "private"/);
 assert.match(body,/getConversationHistory\(\)/);
 assert.match(body,/getDeviceMemory\(\)/);
 assert.match(body,/getLastControlled\(\)/);
 assert.doesNotMatch(body,/JSON\.stringify\(messages\)|messages\.map\(/);
});