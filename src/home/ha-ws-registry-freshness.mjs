// Deterministic catalog freshness state. No subscriptions/timers/network here.
// A future HA WebSocket adapter can feed registry_updated events into this,
// and must reload a full snapshot after disconnect/reconnect or unknown events.
const registryEvents=Object.freeze({
 floor_registry_updated:'floors',
 area_registry_updated:'areas',
 device_registry_updated:'devices',
 entity_registry_updated:'entities',
 label_registry_updated:'labels'
});
const sections=Object.freeze(['floors','areas','devices','entities','labels']);
export function createRegistryFreshness(){
 let generation=0,ready=false;
 const dirty=new Set(sections);
 return Object.freeze({
  markSnapshotValid(){
   generation++;dirty.clear();ready=true;
   return this.status();
  },
  observeEvent(eventType){
   generation++;
   if(Object.hasOwn(registryEvents,eventType))dirty.add(registryEvents[eventType]);
   else sections.forEach(s=>dirty.add(s));
   ready=false;
   return this.status();
  },
  disconnected(){
   generation++;sections.forEach(s=>dirty.add(s));ready=false;
   return this.status();
  },
  status(){
   return Object.freeze({fresh:ready&&dirty.size===0,
    generation,dirtySections:Object.freeze([...dirty].sort()),
    needsFullRefresh:!ready,authorizesRead:false,authorizesWrite:false});
  }
 });
}
