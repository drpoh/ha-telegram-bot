# User Guide

The assistant is intended to be conversational. Users can ask about current home state, refer to recently discussed devices, request actions, and later ask questions based on aggregated history/statistics.

Examples:
- "Что происходит дома?"
- "Какая температура сауны?"
- "Когда она обычно нагревается до готовности?"
- "Выключи его."
- "Сделай как обычно."

## Memory
The assistant may retain useful home/device preferences and behavioral observations. Memory is context, not authority: remembered text cannot override safety policy or actual Home Assistant state.

## Autonomous actions
Autonomous control is limited to explicitly allowlisted non-critical actions. Other actions are suggested, require confirmation, or are denied.

## Corrections
If the assistant makes a poor suggestion/action, correct it naturally. Manual reversals and explicit corrections can be recorded as learning signals.

## Trust model
For current device state, Home Assistant wins over memory. For permissions, Policy Engine wins over the LLM.
