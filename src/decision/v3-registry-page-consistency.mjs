// Offline fixture-only page consistency check. NEVER grants HA authorization.
// A generation token is meaningful only when verified by an authenticated HA source.
export function assessRegistryPages({pages,expectedCount,idField='id'}={}){
 const deny=reason=>({consistent:false,authorization:false,reason});
 if(!Array.isArray(pages)||pages.length===0||!Number.isSafeInteger(expectedCount)||expectedCount<0||
    !['id','entity_id','device_id','area_id'].includes(idField))return deny('invalid_page_request');
 let offset=0,epoch=null;
 const ids=new Set();
 for(let i=0;i<pages.length;i++){
  const p=pages[i];
  if(p?.success!==true||p.partial!==false||!Array.isArray(p.records)||
     !Number.isSafeInteger(p.offset)||p.offset!==offset||
     !Number.isSafeInteger(p.total)||p.total!==expectedCount||
     typeof p.generation!=='string'||!p.generation.trim()||
     typeof p.has_more!=='boolean')return deny('invalid_page_metadata');
  if(epoch===null)epoch=p.generation;
  if(epoch!==p.generation)return deny('registry_changed_during_read');
  if(p.has_more!==(i<pages.length-1)||
     (p.has_more && p.records.length===0)||
     (p.has_more && p.next_offset!==offset+p.records.length)||
     (!p.has_more && p.next_offset!=null))return deny('invalid_page_cursor');
  for(const record of p.records){
   const id=record?.[idField];
   if(typeof id!=='string'||!id.trim()||ids.has(id))return deny('invalid_or_duplicate_record');
   ids.add(id);
  }
  offset+=p.records.length;
 }
 if(offset!==expectedCount)return deny('missing_registry_records');
 return {consistent:true,authorization:false,status:'offline_consistency_only',generation:epoch,count:offset};
}
