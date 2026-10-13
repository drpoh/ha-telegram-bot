import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('shared queue is p-queue with exactly one concurrent handler',()=>{
 const queue=readFileSync(new URL('../src/utils/queue.mjs',import.meta.url),'utf8');
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 const lock=JSON.parse(readFileSync(new URL('../package-lock.json',import.meta.url),'utf8'));
 assert.match(queue,/import PQueue from "p-queue"/);
 assert.match(queue,/new PQueue\(\{concurrency: 1\}\)/);
 assert.match(queue,/requestQueue\.add\(async/);
 assert.doesNotMatch(queue,/let requestQueue = Promise\.resolve\(\)/);
 assert.match(queue,/active: requestQueue\.pending/);
 assert.match(queue,/pending: requestQueue\.size/);
 assert.match(queue,/queueConfirmedAction/);
 assert.match(queue,/typeof authorize !== "function"/);
 assert.match(queue,/consumePendingConfirmation/);
 assert.equal(pkg.dependencies['p-queue'],'^8.1.1');
 assert.equal(lock.packages[''].dependencies['p-queue'],'^8.1.1');
 assert.ok(lock.packages['node_modules/p-queue']);
 assert.ok(lock.packages['node_modules/p-timeout']);
 assert.ok(lock.packages['node_modules/eventemitter3']);
});
