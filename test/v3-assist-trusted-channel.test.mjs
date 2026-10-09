import test from 'node:test';import assert from 'node:assert/strict';import{createAssistTrustedChannel}from '../src/decision/v3-assist-trusted-channel.mjs';
const channel=createAssistTrustedChannel({satelliteId:'m5stack-echo',clock:()=>20000});
const e={eventId:'trusted-event-001',issuedAt:19000,transcript:'Включён ли свет?'};
test('fixed-channel offline event is device-only and unauthorized',()=>{const r=channel.receive(e);assert.equal(r.accepted,true);assert.equal(r.command.sourceId,'m5stack-echo');assert.equal(r.command.actorId,null);assert.equal(r.authorization,'not_granted');});
test('event replay rejected',()=>assert.equal(channel.receive(e).reason,'replayed_event'));
test('payload cannot claim satellite, identity or trust',()=>{for(const extra of [{satelliteId:'other'},{authenticated:true},{claimedUserId:17},{transportVerified:true}])assert.equal(channel.receive({...e,eventId:'trusted-event-002',...extra}).accepted,false);});
test('stale and unsigned event data rejected',()=>{assert.equal(channel.receive({...e,eventId:'trusted-event-003',issuedAt:1}).accepted,false);assert.equal(channel.receive({...e,eventId:'short'}).accepted,false);});
