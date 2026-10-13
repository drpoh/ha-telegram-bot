import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('opt-in /debug is owner-private and only traces fresh AI calls',()=>{
 const src=readFileSync(new URL('../src/telegram/bot.mjs',import.meta.url),'utf8');
 const i=src.indexOf('bot.command("debug"');
 const j=src.indexOf('bot.command("model"',i);
 assert.ok(i>0 && j>i);
 const handler=src.slice(i,j);
 assert.match(handler,/isAllowed\(ctx\)/);
 assert.match(handler,/ctx\.chat\?\.type !== "private"/);
 assert.match(handler,/\["on", "off"\]/);
 assert.match(handler,/debugModelChats\.add/);
 assert.match(handler,/debugModelChats\.delete/);
 assert.match(src,/ai\.timestamp >= startedAt/);
 assert.match(src,/debugModelChats\.has\(ctx\.from\.id\)/);
 assert.match(src,/getAIStatus\(\)/);
});
