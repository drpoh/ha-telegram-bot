#!/usr/bin/env node
// Manual, explicitly operator-invoked read-only HA-MCP summary for four owner-observed kitchen entities.
// Do not schedule; no Telegram poller, HA service calls, or physical identity assertion.
import {summarizeReviewedKitchenLights} from '../../src/home/kitchen-light-readonly-status.mjs';
import {createReviewedLightReadonlyReader} from '../../src/home/reviewed-light-readonly-client.mjs';

if(process.argv.slice(2).join(' ')!=='--readonly --operator-approved'){
 console.error('USAGE: node scripts/manual/v3-kitchen-lights-readonly-preflight.mjs --readonly --operator-approved');
 process.exitCode=2;
}else{
 try{
  const report=await summarizeReviewedKitchenLights({
   readState:createReviewedLightReadonlyReader()
  });
  if(report.authorization!==false||report.actualWrite!==false)throw Error('read_only_violation');
  console.log('KITCHEN_READONLY_STATUS='+report.status);
  if(report.counts)console.log('KITCHEN_READONLY_COUNTS='+JSON.stringify(report.counts));
  console.log('KITCHEN_READONLY_PHYSICAL_IDENTITY=unverified');
  console.log('KITCHEN_READONLY_TEXT='+report.text);
  process.exitCode=report.status==='complete'?0:1;
 }catch{
  // No transport error message, credentials, endpoint or raw HA response in terminal.
  console.error('KITCHEN_READONLY_STATUS=read_failed');
  process.exitCode=1;
 }
}
