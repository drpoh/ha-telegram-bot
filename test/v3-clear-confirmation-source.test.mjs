import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('destructive clear has private owner gate, 60-second confirmation and cancellation',()=>{
 const source=readFileSync(new URL('../src/telegram/bot.mjs',import.meta.url),'utf8');
 const start=source.indexOf('bot.command("clear"');
 const end=source.indexOf('bot.on("text"',start);
 assert.ok(start>=0&&end>start);
 const h=source.slice(start,end);
 for(const pattern of [/isAllowed\(ctx\)/,/ctx\.chat\?\.type !== "private"/,/CLEAR_TTL_MS/,/args\[1\] === "cancel"/,/args\[1\] !== "confirm"/,/now >= expiresAt/,/clearConfirmations\.delete\(ctx\.from\.id\)/]){
  assert.match(h,pattern);
 }
 assert.ok(h.indexOf('args[1] !== "confirm"')<h.indexOf('clearConversationHistory()'));
});