import test from "node:test";
import assert from "node:assert/strict";
import {checkHaIndependence} from "../src/decision/ha-independence-guard.mjs";
test("AI cannot ask HA to restart, stop, shutdown or reload",()=>{
 for(const args of [
  {domain:"homeassistant",service:"restart"},
  {domain:"homeassistant",service:"stop"},
  {domain:"hassio",service:"host_reboot"},
  {domain:"supervisor",service:"reload"},
  {domain:"automation",service:"reload"},
  {domain:"mqtt",service:"reload"},
  {domain:"light",service:"restart"},
  {domain:"light",service:"stop"},
  {domain:"light",service:"reload"},
  {domain:"",service:"restart"},
 ])assert.equal(checkHaIndependence({name:"ha_call_service",args}).allowed,false,JSON.stringify(args));
});
test("guard distinguishes ordinary light services from HA lifecycle actions",()=>{
 assert.equal(checkHaIndependence({name:"ha_call_service",args:{domain:"light",service:"turn_off"}}).allowed,true);
 assert.equal(checkHaIndependence({name:"ha_get_state",args:{entity_id:"light.test"}}).allowed,true);
});
