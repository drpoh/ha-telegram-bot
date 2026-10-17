import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../homeassistant/custom_components/rs_home_ai_dev/__init__.py",import.meta.url),"utf8");
const flow=readFileSync(new URL("../homeassistant/custom_components/rs_home_ai_dev/config_flow.py",import.meta.url),"utf8");
test("conversation bridge is only configured with a bearer and reuses HA conversation",()=>{
 assert.match(source,/conversation\.async_set_agent/);
 assert.match(source,/conversation\.async_unset_agent/);
 assert.match(source,/async_get_clientsession/);
 assert.match(source,/Authorization.*Bearer/);
 assert.match(source,/conversation_id/);
 assert.match(source,/\/ask/);
});
test("HA UI config restricts bridge to explicit URL and token",()=>{
 assert.match(flow,/CONF_API_TOKEN/);
 assert.match(flow,/len\(user_input\[CONF_API_TOKEN\]\) < 32/);
 assert.match(flow,/parsed\.scheme != "http"/);
});
