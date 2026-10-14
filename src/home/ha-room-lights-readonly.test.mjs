import test from 'node:test';
import assert from 'node:assert/strict';
import {answerRoomLightsReadOnly as answer} from './ha-room-lights-readonly.mjs';
const catalog={
 status:'validated_snapshot',complete:true,
 areas:[{id:'living',name:'Гостиная'},{id:'kitchen',name:'Кухня'}],
 entities:[
  {entityId:'light.living_main',areaId:'living',domain:'light',enabled:true,hidden:false},
  {entityId:'light.living_led',areaId:'living',domain:'light',enabled:true,hidden:false},
  {entityId:'light.kitchen_main',areaId:'kitchen',domain:'light',enabled:true,hidden:false},
  {entityId:'switch.living_aux',areaId:'living',domain:'switch',enabled:true,hidden:false}
 ]
};
const states={
 'light.living_main':{state:'on',name:'Свет'},
 'light.living_led':{state:'off',name:'Подсветка'},
 'light.kitchen_main':{state:'on',name:'Кухня свет'}
};
test('room on-state from complete registry + separately supplied states',()=>{
 const x=answer({catalog,question:'Какой свет включён в гостиной?',stateById:states});
 assert.equal(x.status,'answered');assert.match(x.text,/Свет/);assert.doesNotMatch(x.text,/Подсветка/);assert.equal(x.context.areaId,'living');
});
test('follow-up question stays in last room, not kitchen',()=>{
 const first=answer({catalog,question:'Какой свет включен в гостиной?',stateById:states});
 const x=answer({catalog,question:'А какой выключен?',context:first.context,stateById:states});
 assert.equal(x.status,'answered');assert.match(x.text,/Подсветка/);assert.doesNotMatch(x.text,/Кухня/);
});
test('explicit other room overrides earlier room',()=>{
 const x=answer({catalog,question:'На кухне что включено?',context:{kind:'room_lights',areaId:'living'},stateById:states});
 assert.equal(x.areaId,'kitchen');assert.match(x.text,/Кухня свет/);
});
test('never infer current state from registry metadata',()=>{
 assert.equal(answer({catalog,question:'Что включено на кухне?'}).reason,'state_not_provided');
});
test('incomplete light state fails closed',()=>{
 assert.equal(answer({catalog,question:'Какой свет включен в гостиной?',stateById:{'light.living_main':states['light.living_main']}}).reason,'incomplete_or_untrusted_states');
});
test('action wording is denied, no executor',()=>{
 assert.equal(answer({catalog,question:'Выключи свет в гостиной',stateById:states}).reason,'action_denied');
});
test('without last room follow-up needs clarification',()=>{
 assert.equal(answer({catalog,question:'А какой выключен?',stateById:states}).reason,'area_not_identified');
});
test('unavailable lights are disclosed, never called off',()=>{
 const x=answer({catalog,question:'Какой выключен в гостиной?',stateById:{...states,'light.living_led':{state:'unavailable',name:'Подсветка'}}});
 assert.equal(x.status,'answered');assert.match(x.text,/Недоступны или неизвестны: 1/);
 assert.doesNotMatch(x.text,/выключены: Подсветка/);
});
test('unverified registry, ambiguous room and unknown context fail closed',()=>{
 assert.equal(answer({catalog:{...catalog,complete:false},question:'Что включено на кухне?',stateById:states}).reason,'catalog_not_fresh');
 assert.equal(answer({catalog,question:'Что включено?',context:{kind:'room_lights',areaId:'missing'},stateById:states}).reason,'area_not_identified');
});
