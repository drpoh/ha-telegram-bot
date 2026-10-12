import test from 'node:test';import assert from 'node:assert/strict';import{createAssistIngressGuard}from '../src/decision/v3-assist-ingress-guard.mjs';
const guard=createAssistIngressGuard({knownSatellites:['m5stack-echo'],clock:()=>20000});
const event={transportVerified:true,satelliteId:'m5stack-echo',transcript:'Включён ли свет?',eventId:'assist-test-0001',issuedAt:19000};
test('verified device-only event is never authorized',()=>{const r=guard.receive(event);assert.equal(r.accepted,true);assert.equal(r.command.actorId,null);assert.equal(r.authorization,'not_granted');});
test('replay is rejected',()=>assert.equal(guard.receive(event).reason,'replayed_event'));
test('unverified transport, stale and future timestamps rejected',()=>{for(const change of [{transportVerified:false},{issuedAt:1},{issuedAt:20001}])assert.equal(guard.receive({...event,eventId:'assist-test-0002',...change}).accepted,false);});
test('speaker claim and unknown device denied',()=>{assert.equal(guard.receive({...event,eventId:'assist-test-0003',claimedUserId:1}).accepted,false);assert.equal(guard.receive({...event,eventId:'assist-test-0004',satelliteId:'other'}).accepted,false);});

test('capacity exhausts closed without evicting replay keys',()=>{const g=createAssistIngressGuard({knownSatellites:['m5stack-echo'],clock:()=>20000,maxSeen:1});assert.equal(g.receive(event).accepted,true);assert.equal(g.receive({...event,eventId:'assist-test-0009'}).reason,'replay_capacity_exhausted');assert.equal(g.receive(event).reason,'replayed_event');});
