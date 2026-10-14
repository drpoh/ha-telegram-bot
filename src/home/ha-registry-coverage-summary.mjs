// Aggregate-only HA catalog coverage; never leaks IDs, names or any HA state.
// A valid five-registry snapshot is prerequisite for this report.
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const fail=reason=>Object.freeze({status:'unverified',reason,authorizesRead:false,authorizesWrite:false});
const keys=['floors','areas','devices','entities','labels',
 'unassignedEntities','unassignedDevices','disabledEntities','hiddenEntities'];
export function summarizeHARegistryCoverage(snapshot){
 if(snapshot?.status!=='validated_snapshot'||snapshot?.complete!==true||
    !snapshot?.counts||keys.some(k=>!integer(snapshot.counts[k])))
  return fail('snapshot_unverified');
 const c=snapshot.counts;
 if(c.unassignedEntities>c.entities||c.unassignedDevices>c.devices||
    c.disabledEntities>c.entities||c.hiddenEntities>c.entities)
  return fail('counts_inconsistent');
 if(!Array.isArray(snapshot.entities)||snapshot.entities.length!==c.entities)
  return fail('entity_count_inconsistent');
 const domainCounts=Object.create(null);
 let classifiedRooms=0;
 for(const entry of snapshot.entities){
  if(typeof entry?.domain!=='string'||!/^[a-z0-9_]+$/.test(entry.domain)||
     !('areaId' in entry)||typeof entry?.readApproved!=='boolean'||
     entry.readApproved!==false||entry.actionApproved!==false)
   return fail('invalid_entity_summary');
  domainCounts[entry.domain]=(domainCounts[entry.domain]??0)+1;
  if(entry.areaId!==null)classifiedRooms++;
 }
 if(classifiedRooms!==c.entities-c.unassignedEntities)return fail('area_counts_inconsistent');
 const domains=Object.entries(domainCounts)
  .map(([domain,count])=>({domain,count}))
  .sort((a,b)=>b.count-a.count||a.domain.localeCompare(b.domain));
 return Object.freeze({
  status:'validated_aggregate',
  registryCounts:Object.freeze({...Object.fromEntries(keys.map(k=>[k,c[k]]))}),
  assignedDevices:c.devices-c.unassignedDevices,
  assignedEntities:c.entities-c.unassignedEntities,
  enabledEntities:c.entities-c.disabledEntities,
  domains:Object.freeze(domains.map(x=>Object.freeze(x))),
  countsAreRegistryRecords:true,
  physicalDeviceCountKnown:false,
  unassignedIsNotError:true,
  stateReadPerformed:false,authorizesRead:false,authorizesWrite:false
 });
}
