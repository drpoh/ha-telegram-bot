#!/usr/bin/env node
// Explicit offline-only Stage fixture process. No live HA or Telegram integration.
import {createStageMockHa} from '../../src/ops/stage-mock-ha.mjs';

if(Object.keys(process.env).some(key=>/^(?:HA_|HASS_|MCP_|TELEGRAM_|GEMINI_|OPENROUTER_|DATABASE_URL|RS_HOME_AI_PROD)/i.test(key))){
 console.error('stage_rejects_live_environment');process.exit(64);
}
const raw=process.env.RS_STAGE_PORT??'0';
if(!/^(0|[1-9]\d{3,4})$/.test(raw)||Number(raw)>65535){console.error('invalid_stage_port');process.exit(64);}
const server=createStageMockHa({host:'127.0.0.1',port:Number(raw),entities:[]});
try{
 const address=await server.start();console.log(JSON.stringify({environment:'stage',mode:'mock',address:address.address,port:address.port,haWrites:false}));
}catch{console.error('stage_start_failed');process.exit(1);}
let closing=false;
const close=async()=>{if(closing)return;closing=true;await server.close();process.exit(0);};
process.on('SIGTERM',close);process.on('SIGINT',close);
