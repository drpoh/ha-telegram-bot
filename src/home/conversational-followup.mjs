// Pure, non-authorizing conversational follow-up resolver for read-only topics.
//
// CALLER TRUST & PROVENANCE REQUIREMENTS:
// 1. Callers MUST pass trusted prior conversation context originating strictly from a
//    completed, authenticated read-only interaction with the same Telegram user/actor.
// 2. Callers MUST ensure priorContext has not been tampered with or synthesized by untrusted input.
// 3. Callers SHOULD provide actorId and timestamp in priorContext for freshness/identity verification.
// 4. This module is stateless, offline, and non-authorizing. It NEVER infers write intent,
//    never issues physical actions, and never expands target entity allowlists.

import { classifyReadonlyQuestion, classifyLightQuestionMode } from './readonly-question-intent.mjs';
import { classifySaunaQuestionMode } from './sauna-question-mode.mjs';

const clean = text => typeof text === 'string'
  ? text.toLowerCase().replace(/ё/g, 'е').trim().replace(/[?.!]+$/g, '').replace(/\s+/g, ' ')
  : '';

const SAUNA_FOLLOWUPS = Object.freeze({
  ready: new Set([
    'а она готова', 'она готова', 'готова', 'готова ли', 'а готова',
    'а готова ли', 'уже готова', 'нагрелась', 'а нагрелась'
  ]),
  temperature: new Set([
    'а какая температура', 'какая температура', 'а сколько градусов',
    'сколько градусов', 'а температура', 'температура', 'сколько сейчас'
  ]),
  status: new Set([
    'а что с ней', 'что с ней', 'а что с сауной', 'а состояние'
  ])
});

const LIGHTS_FOLLOWUPS = Object.freeze({
  all_off: new Set([
    'а весь', 'а весь свет', 'весь', 'весь ли', 'а все', 'а весь выключен', 'все выключены'
  ]),
  off: new Set([
    'а какой выключен', 'какой выключен', 'а какие выключены', 'какие выключены',
    'а выключенный', 'а выключен', 'где выключен'
  ]),
  overview: new Set([
    'а какой включен', 'какой включен', 'а какие включены', 'какие включены',
    'а включенный', 'состояние', 'а состояние'
  ])
});

const TAMBOUR_FOLLOWUPS = Object.freeze({
  overview: new Set([
    'а он включен', 'а горит', 'а что с ним'
  ])
});

const FOLLOWUP_MAP = Object.freeze({
  sauna: SAUNA_FOLLOWUPS,
  lights: LIGHTS_FOLLOWUPS,
  tambour: TAMBOUR_FOLLOWUPS
});

/**
 * Resolves a natural follow-up or direct question against trusted prior context.
 *
 * @param {Object} options
 * @param {string} options.input - Raw user text input.
 * @param {Object|string} [options.priorContext] - Trusted prior context.
 * @param {string} [options.priorContext.topic] - Prior topic ('sauna' | 'lights' | 'tambour').
 * @param {string|number} [options.priorContext.actorId] - ID of actor who produced the prior context.
 * @param {number} [options.priorContext.timestamp] - Unix ms timestamp when prior topic was active.
 * @param {number} [options.priorContext.ttlMs] - Freshness TTL in ms (default 300,000ms = 5 min).
 * @param {string|number} [options.currentActorId] - Current authenticated actor ID.
 * @param {number} [options.now] - Current timestamp in ms (defaults to Date.now()).
 * @returns {Object} Resolution result: { resolved: boolean, topic: string|null, mode: string|null, source: string, reason?: string }
 */
export function resolveReadonlyFollowup({
  input,
  priorContext,
  currentActorId,
  now = Date.now()
} = {}) {
  // 1. Check if input is a direct standalone read-only question first
  const directTopic = classifyReadonlyQuestion(input);
  if (directTopic && directTopic !== 'unsupported_question') {
    let mode = 'overview';
    if (directTopic === 'sauna') {
      mode = classifySaunaQuestionMode(input);
    } else if (directTopic === 'lights') {
      mode = classifyLightQuestionMode(input);
    }
    return { resolved: true, topic: directTopic, mode, source: 'direct' };
  }

  // 2. Validate prior context object/topic
  const contextObj = typeof priorContext === 'string' ? { topic: priorContext } : (priorContext || null);

  if (!contextObj || typeof contextObj !== 'object') {
    return { resolved: false, topic: null, mode: null, source: 'none', reason: 'missing_prior_context' };
  }

  const { topic, actorId, timestamp, ttlMs = 300000 } = contextObj;

  if (!topic || !FOLLOWUP_MAP[topic]) {
    return { resolved: false, topic: null, mode: null, source: 'none', reason: 'unsupported_topic_context' };
  }

  // 3. Verify actor provenance if provided
  if (actorId !== undefined && currentActorId !== undefined && actorId !== currentActorId) {
    return { resolved: false, topic: null, mode: null, source: 'none', reason: 'mismatched_actor' };
  }

  // 4. Verify freshness window if timestamp is provided
  if (typeof timestamp === 'number' && Number.isFinite(timestamp)) {
    if (now - timestamp > ttlMs || now < timestamp) {
      return { resolved: false, topic: null, mode: null, source: 'none', reason: 'stale_prior_context' };
    }
  }

  // 5. Match input against follow-up phrases for the active topic
  const text = clean(input);
  const topicMap = FOLLOWUP_MAP[topic];

  for (const [mode, phraseSet] of Object.entries(topicMap)) {
    if (phraseSet.has(text)) {
      return { resolved: true, topic, mode, source: 'followup' };
    }
  }

  // 6. Check if text matches a follow-up phrase for a DIFFERENT topic (topic mismatch)
  for (const [otherTopic, otherMap] of Object.entries(FOLLOWUP_MAP)) {
    if (otherTopic === topic) continue;
    for (const phraseSet of Object.values(otherMap)) {
      if (phraseSet.has(text)) {
        return { resolved: false, topic: null, mode: null, source: 'none', reason: 'mismatched_topic_context' };
      }
    }
  }

  // 7. Unmatched or unsupported follow-up input
  return { resolved: false, topic: null, mode: null, source: 'none', reason: 'unsupported_followup' };
}
