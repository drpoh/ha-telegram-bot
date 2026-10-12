import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyReadonlyQuestion,classifyLightQuestionMode} from '../src/home/readonly-question-intent.mjs';

test('Russian off-light queries stay in bounded read-only overview',()=>{
 for(const question of ['Какой свет выключен?', 'Какие светильники выключены?', 'Где выключен свет?', 'Весь ли свет выключен?']){
  assert.equal(classifyReadonlyQuestion(question),'lights');
 }
 assert.equal(classifyReadonlyQuestion('Выключи свет в коридоре'),null);
 assert.equal(classifyReadonlyQuestion('Какие выключатели доступны?'),'unsupported_question');
});

test('read-only Russian questions choose focused response while keeping existing intent category',()=>{
 for(const phrase of ['Какой свет выключен?','Какие светильники выключены?','Где выключен свет?']){
  assert.equal(classifyReadonlyQuestion(phrase),'lights');
  assert.equal(classifyLightQuestionMode(phrase),'off');
 }
 for(const phrase of ['Весь ли свет выключен?','Весь ли выбранный свет выключен?']){
  assert.equal(classifyReadonlyQuestion(phrase),'lights');
  assert.equal(classifyLightQuestionMode(phrase),'all_off');
 }
 assert.equal(classifyLightQuestionMode('Где горит свет?'),'overview');
 assert.equal(classifyLightQuestionMode('/lights'),'overview');
 assert.equal(classifyReadonlyQuestion('Выключи свет в коридоре'),null);
});
