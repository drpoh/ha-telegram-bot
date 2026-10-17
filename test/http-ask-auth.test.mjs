import test from "node:test";
import assert from "node:assert/strict";
import { isAuthorizedHttpRequest } from "../src/api/server.mjs";
const key="x".repeat(48);
test("HTTP ask fails closed without configured secret",()=>{
 assert.equal(isAuthorizedHttpRequest("Bearer "+key,null),false);
 assert.equal(isAuthorizedHttpRequest("Bearer "+key,"short"),false);
});
test("HTTP ask rejects missing, wrong or malformed bearer",()=>{
 for(const authorization of [undefined,"","Basic "+key,"Bearer "+("y".repeat(48)),"Bearer "+key+"x"]){
  assert.equal(isAuthorizedHttpRequest(authorization,key),false);
 }
});
test("HTTP ask accepts exact matching configured bearer",()=>{
 assert.equal(isAuthorizedHttpRequest("Bearer "+key,key),true);
});
