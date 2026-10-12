import test from "node:test";
import assert from "node:assert/strict";
import {normalizeV3Command,mayRequestV3Action} from "../src/decision/v3-command-envelope.mjs";
const base={sourceId:"atom-echo.sauna",text:"Включи свет",issuedAt:100};
test("Assist has device identity only, never user identity from speech",()=>{
 const result=normalizeV3Command({...base,source:"assist"});
 assert.equal(result.accepted,true);
 assert.equal(result.command.actorId,null);
 assert.equal(result.command.assurance,"device_only");
 assert.equal(mayRequestV3Action(result.command,{risk:"low"}),true);
 assert.equal(mayRequestV3Action(result.command,{risk:"high"}),false);
 assert.equal(mayRequestV3Action(result.command,{requiresPersonalIdentity:true}),false);
 assert.equal(normalizeV3Command({...base,source:"assist",actorId:12}).accepted,false);
 assert.equal(normalizeV3Command({...base,source:"assist",authenticated:true}).accepted,false);
});
test("Telegram needs authenticated transport; malformed sources fail closed",()=>{
 assert.equal(normalizeV3Command({...base,source:"telegram",actorId:7}).accepted,false);
 const result=normalizeV3Command({...base,source:"telegram",authenticated:true,actorId:7});
 assert.equal(result.accepted,true);
 assert.equal(mayRequestV3Action(result.command,{risk:"high"}),true);
 assert.equal(normalizeV3Command({...base,source:"unknown"}).accepted,false);
 assert.equal(normalizeV3Command({...base,source:"assist",sourceId:"../../bad"}).accepted,false);
 assert.equal(normalizeV3Command({...base,source:"local_test",authenticated:true}).accepted,false);
});
