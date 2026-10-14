import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeHARegistryCoverage} from '../src/home/ha-registry-coverage-summary.mjs';
const record=(entityId,domain,areaId)=>({entityId,domain,areaId,readApproved:false,actionApproved:false});
const sample=()=>({
 status:'validated_snapshot',complete:true,
 counts:{floors:2,areas:17,devices:294,entities:3,labels:15,
 unassignedEntities:2,unassignedDevices:194,disabledEntities:1,hiddenEntities:1},
 entities:[record('light.hall','light','hall'),record('sensor.helper','sensor',null),record('light.other','light',null)]
});
test('summarize only verified complete five-registry record counts and safe domain aggregates',()=>{
 const r=summarizeHARegistryCoverage(sample());
 assert.equal(r.status,'validated_aggregate');
 assert.equal(r.assignedDevices,100);
 assert.equal(r.assignedEntities,1);
 assert.equal(r.enabledEntities,2);
 assert.deepEqual(r.domains,[{domain:'light',count:2},{domain:'sensor',count:1}]);
 assert.equal(r.countsAreRegistryRecords,true);
 assert.equal(r.physicalDeviceCountKnown,false);
 assert.equal(r.unassignedIsNotError,true);
 assert.equal(r.authorizesRead,false);
 assert.equal(r.authorizesWrite,false);
 assert.doesNotMatch(JSON.stringify(r),/light\.hall|sensor\.helper/);
});
test('refuse partial, inconsistent counts, unexpected permissions or unknown domains',()=>{
 assert.equal(summarizeHARegistryCoverage({}).status,'unverified');
 let x=sample();x.counts.unassignedEntities=4;
 assert.equal(summarizeHARegistryCoverage(x).reason,'counts_inconsistent');
 x=sample();x.entities.pop();
 assert.equal(summarizeHARegistryCoverage(x).reason,'entity_count_inconsistent');
 x=sample();x.entities[0].readApproved=true;
 assert.equal(summarizeHARegistryCoverage(x).reason,'invalid_entity_summary');
 x=sample();x.entities[0].domain='bad/unsafe';
 assert.equal(summarizeHARegistryCoverage(x).reason,'invalid_entity_summary');
 x=sample();x.entities[0].areaId=null;
 assert.equal(summarizeHARegistryCoverage(x).reason,'area_counts_inconsistent');
});
