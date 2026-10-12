// Read-only fixture review for a fixed owner-exported set of new light candidates.
// This is an OFFLINE verifier and deliberately does not import or modify the live MCP
// client allowlist, Telegram pilot or action policy.
import {NEW_LIGHT_CANDIDATES,validateNewLightCandidates} from './new-light-candidates.mjs';
const MAX=40;
export async function inspectNewLights({readState,candidates=NEW_LIGHT_CANDIDATES}={}){
 const denial={status:'invalid_inventory',authorization:false,actualWrite:false,entries:[],counts:{on:0,off:0,unknown:0}};
 if(typeof readState!=='function'||!validateNewLightCandidates(candidates)||candidates.length>MAX)return denial;
 const entries=[];
 const counts={on:0,off:0,unknown:0};
 for(const candidate of candidates){
  let state='unknown';
  let reason='read_error';
  try{
   const raw=await readState(candidate.id);
   const body=raw?.structuredContent??raw;
   const value=body?.data??body;
   if(raw?.isError===true)reason='mcp_error';
   else if(value?.entity_id!==candidate.id)reason='identity_mismatch';
   else if(['on','off'].includes(value.state)){state=value.state;reason='ok';}
   else if(['unknown','unavailable'].includes(value.state))reason=value.state;
   else reason='invalid_state';
  }catch{}
  counts[state]++;
  entries.push(Object.freeze({id:candidate.id,area:candidate.area,label:candidate.label,state,reason,review:'unverified'}));
 }
 return {status:counts.unknown?'partial':'complete',authorization:false,actualWrite:false,entries,counts};
}
