import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const platform=readFileSync(new URL("../homeassistant/custom_components/rs_home_ai_dev/conversation.py",import.meta.url),"utf8");
const init=readFileSync(new URL("../homeassistant/custom_components/rs_home_ai_dev/__init__.py",import.meta.url),"utf8");
const flow=readFileSync(new URL("../homeassistant/custom_components/rs_home_ai_dev/config_flow.py",import.meta.url),"utf8");
test("conversation platform handles HA lifecycle",()=>{
 assert.match(init,/async_forward_entry_setups/);
 assert.match(init,/async_unload_platforms/);
 assert.match(platform,/conversation.ConversationEntity/);
 assert.match(platform,/conversation.async_set_agent\(self.hass, self.entry, self\)/);
 assert.match(platform,/conversation.async_unset_agent\(self.hass, self.entry\)/);
});
test("bridge forwards authorized speech while preserving conversation ID",()=>{
 assert.match(platform,/async_get_clientsession/);
 assert.match(platform,/Authorization.*Bearer/);
 assert.match(platform,/conversation_id/);
 assert.match(platform,/\/ask/);
});
test("HA config flow checks token and URL",()=>{
 assert.match(flow,/CONF_API_TOKEN/);
 assert.match(flow,/len\(user_input\[CONF_API_TOKEN\]\) < 32/);
 assert.match(flow,/parsed\.scheme != "http"/);
});
