#!/usr/bin/env node
// Manual, opt-in, ONE exact HA light entity read. No Telegram polling or service calls.
// This is state evidence only; it cannot establish device/area or physical identity.
import {NEW_LIGHT_IDS} from '../../src/home/new-light-candidates.mjs';
import {inspectSingleNewLight} from '../../src/home/single-new-light-status.mjs';
import {createReviewedLightReadonlyReader} from '../../src/home/reviewed-light-readonly-client.mjs';

const args=process.argv.slice(2);
if(args.length!==3||args[0]!=='--readonly'||args[1]!=='--operator-approved'||!NEW_LIGHT_IDS.includes(args[2])){
 console.error('USAGE: node scripts/manual/v3-single-light-readonly-preflight.mjs --readonly --operator-approved light.kukhnia_svet');
 process.exitCode=2;
}else{
 try{
  const result=await inspectSingleNewLight({
   entityId:args[2],readState:createReviewedLightReadonlyReader()
  });
  if(result.authorization!==false||result.actualWrite!==false)throw Error('read_only_violation');
  console.log('SINGLE_LIGHT_ID='+args[2]);
  console.log('SINGLE_LIGHT_STATUS='+result.status);
  console.log('SINGLE_LIGHT_STATE='+(result.state??'unknown'));
  console.log('SINGLE_LIGHT_PHYSICAL_IDENTITY=unverified');
  process.exitCode=result.status==='complete'?0:1;
 }catch{
  // Never print tokens, endpoint URLs or raw MCP errors to the console.
  console.error('SINGLE_LIGHT_STATUS=read_failed');
  process.exitCode=1;
 }
}
