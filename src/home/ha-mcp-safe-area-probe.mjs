// Pure validation for an explicitly named read-only MCP tool.
export function approveAreaList(tool){
 if(tool?.name!=='ha_list_floors_areas'||tool?.inputSchema?.type!=='object')
  return false;
 const required=tool.inputSchema.required;
 return required===undefined||(Array.isArray(required)&&required.length===0);
}
export function summarizeAreaReply(reply){
 if(!reply||typeof reply!=='object')return {status:'invalid'};
 const data=reply.structuredContent;
 const keys=data&&typeof data==='object'&&!Array.isArray(data)
  ?Object.keys(data).filter(x=>/^[a-z][a-z0-9_]{0,63}$/.test(x)).sort().slice(0,20):[];
 return {status:reply.isError?'tool_error':'shape_only',structured:!!data,
  keys,textBlocks:Array.isArray(reply.content)?reply.content.filter(x=>x?.type==='text').length:0,
  noStatesRead:true,writes:0};
}
