import test from 'node:test';
import assert from 'node:assert/strict';
import {classifySaunaQuestionMode} from '../src/home/sauna-question-mode.mjs';
import {classifyReadonlyQuestion} from '../src/home/readonly-question-intent.mjs';

test('only previously supported sauna questions select short answers',()=>{
 for(const q of ['Какая температура в сауне?','Сколько градусов в сауне?','Температура сауны','Сколько сейчас градусов в сауне?']){
  assert.equal(classifyReadonlyQuestion(q),'sauna');
  assert.equal(classifySaunaQuestionMode(q),'temperature');
 }
 for(const q of ['Сауна готова?','Готова ли сауна?']){
  assert.equal(classifyReadonlyQuestion(q),'sauna');
  assert.equal(classifySaunaQuestionMode(q),'ready');
 }
 assert.equal(classifyReadonlyQuestion('Что с сауной?'),'sauna');
 assert.equal(classifySaunaQuestionMode('Что с сауной?'),'status');
 assert.equal(classifySaunaQuestionMode('/sauna'),'status');
});

test('question normalization handles spaces, case, and punctuation',()=>{
 assert.equal(classifySaunaQuestionMode(' СКОЛЬКО   ГРАДУСОВ В САУНЕ?! '),'temperature');
 assert.equal(classifySaunaQuestionMode('   Готова ли сауна??? '),'ready');
 assert.equal(classifySaunaQuestionMode('Включи сауну'),'status');
 assert.equal(classifyReadonlyQuestion('Включи сауну'),null);
});
