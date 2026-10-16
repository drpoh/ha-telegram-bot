import test from "node:test";
import assert from "node:assert/strict";
import { assessSearchCoverage } from "../src/home/search-coverage.mjs";

test("missing or malformed search never implies complete inventory", () => {
 assert.equal(assessSearchCoverage(null).complete, false);
 assert.equal(assessSearchCoverage({ success:true, entities:[] }).complete, false);
});
test("pagination and partial results are incomplete", () => {
 const base={success:true,entities:[{entity_id:"sensor.one"}],entity_total_matches:2,offset:0};
 assert.equal(assessSearchCoverage(base).complete,false);
 assert.equal(assessSearchCoverage({...base,partial:true}).complete,false);
 assert.equal(assessSearchCoverage({...base,entity_has_more:true}).complete,false);
});
test("complete search page is not a complete HA registry", () => {
 assert.deepEqual(assessSearchCoverage({success:true,entities:[{entity_id:"sensor.one"}],entity_total_matches:1,offset:0}), {complete:true,reason:"search_page_complete"});
});
