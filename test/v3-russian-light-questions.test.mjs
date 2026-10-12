import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyReadonlyQuestion} from '../src/home/readonly-question-intent.mjs';

test('Russian off-light queries stay in bounded read-only overview',()=>{
 for(const question of ['Какой свет выключен?', 'Какие светильники выключены?', 'Где выключен свет?', 'Весь ли свет выключен?']){
  assert.equal(classifyReadonlyQuestion(question),'lights');
 }
 assert.equal(classifyReadonlyQuestion('Выключи свет в коридоре'),null);
 assert.equal(classifyReadonlyQuestion('Какие выключатели доступны?'),'unsupported_question');
});
