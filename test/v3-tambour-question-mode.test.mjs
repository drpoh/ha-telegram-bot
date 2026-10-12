import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyTambourQuestionMode} from '../src/home/tambour-question-mode.mjs';
import {classifyReadonlyQuestion} from '../src/home/readonly-question-intent.mjs';

test('trusted explicit tambour yes-no questions get focused answers',()=>{
 for(const value of ['Горит ли свет в тамбуре?','Свет в тамбуре включён?',' СВЕТ В ТАМБУРЕ ВКЛЮЧЕН?! ']){
  assert.equal(classifyReadonlyQuestion(value),'tambour');
  assert.equal(classifyTambourQuestionMode(value),'yes_no');
 }
});
test('other supported tambour questions and slash command retain full status',()=>{
 for(const value of ['Состояние света в тамбуре?','Что со светом в тамбуре?','/light']){
  assert.equal(classifyTambourQuestionMode(value),'status');
 }
 assert.equal(classifyReadonlyQuestion('Выключи свет в тамбуре'),null);
});
