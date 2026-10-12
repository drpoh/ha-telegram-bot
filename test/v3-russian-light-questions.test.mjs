import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyReadonlyQuestion} from '../src/home/readonly-question-intent.mjs';

test('Russian off-light queries classify to concise off-intent',()=>{
 for(const question of ['Какой свет выключен?', 'Какие светильники выключены?', 'Где выключен свет?', 'Какие лампы сейчас выключены?', 'Покажи выключенный свет']){
  assert.equal(classifyReadonlyQuestion(question),'lights_off');
 }
 for(const question of ['Весь ли свет выключен?', 'Весь ли выбранный свет выключен?']){
  assert.equal(classifyReadonlyQuestion(question),'lights_all_off');
 }
 assert.equal(classifyReadonlyQuestion('Выключи свет в коридоре'),null);
 assert.equal(classifyReadonlyQuestion('Какие выключатели доступны?'),'unsupported_question');
});
