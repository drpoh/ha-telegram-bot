import { generateAI } from "./router.mjs";
import { buildSystemPrompt } from "./prompt.mjs";
import { getKnownDeviceContext } from "../home/entity-resolver.mjs";


import {
  addToHistory,
  getConversationHistory,
} from "../memory/conversation.mjs";

import {
  getDeviceMemoryText,
} from "../memory/devices.mjs";

import { callHA } from "../mcp/executor.mjs";
import {
  isAiSceneTool,
  callAiSceneTool,
} from "../scenes/tools.mjs";
import { rememberControlledMany } from "../memory/controlled.mjs";
import { startLearningSession } from "../learning/session.mjs";
import { getLastControlledText } from "../memory/controlled.mjs";
import { finalizeLearning } from "../learning/learner.mjs";
import { isAiHistoryTool, callAiHistoryTool } from "../history/tools.mjs";
import { resolveKnownDevice } from "../home/entity-resolver.mjs";
import { buildHomeContext, renderHomeContext } from "../context/builder.mjs";
import {
  shadowEvaluateToolCall,
  logShadowDecision,
} from "../decision/shadow.mjs";
import {
  ACTION_SOURCES,
  applyBehaviorDowngrade,
  enforceActionSource,
} from "../policy/engine.mjs";
import { autonomyPolicy } from "../policy/config.mjs";
import { createPendingConfirmation } from "../decision/pending-confirmation.mjs";
import { getOperationalContextForEntity } from "../memory/operational.mjs";
import {
  getBehaviorCorrectionSignal,
  observeBehaviorAction,
} from "../learning/corrections.mjs";

const MAX_AGENT_STEPS = 10;

export function isReadStateRequest(text = "") {
  return /(состояни|статус|включен|включён|выключен|выключён|работает|горит|открыт|закрыт|температур|сколько\s+(?:сейчас\s+)?градус)/i.test(text);
}

function extractState(result, entityId) {
  const content = result?.structuredContent ?? result;
  const data = content?.data ?? content;

  if (data?.entity_id === entityId) return data;
  if (data?.data?.entity_id === entityId) return data.data;
  if (data?.state?.entity_id === entityId) return data.state;
  if (data?.entity?.entity_id === entityId) return data.entity;
  return null;
}

async function buildCurrentStateContext(userText) {
  if (!isReadStateRequest(userText)) return "";

  const device = resolveKnownDevice(userText);
  if (!device?.entity_id) return "";

  try {
    const result = await callHA("ha_get_state", {
      entity_id: device.entity_id,
    });
    const state = extractState(result, device.entity_id);
    if (!state) return "";

    return renderHomeContext(buildHomeContext({
      currentState: [{
        entity_id: device.entity_id,
        name: device.name,
        state: state.state,
      }],
      memories: getOperationalContextForEntity(device.entity_id, 3),
      limits: { currentState: 1, memories: 3 },
    }));
  } catch (error) {
    console.error(
      "Current state context failed:",
      error?.message || error
    );
    return "";
  }
}

export async function askHomeAssistant(
  userText,
  {
    source = ACTION_SOURCES.USER_EXPLICIT,
    policy = autonomyPolicy,
    actor = null,
  } = {}
) {
  startLearningSession(userText);
  const deviceContext = getDeviceMemoryText();
  const controlledContext = getLastControlledText();
  const knownDeviceContext = getKnownDeviceContext(userText);
  const homeContext = await buildCurrentStateContext(userText);
  const contents = [
    ...getConversationHistory(),
    {
      role: "user",
      parts: [
        {
          text: buildSystemPrompt(
            userText,
            deviceContext,
            controlledContext,
            knownDeviceContext,
            homeContext
          ),
        },
      ],
    },
  ];

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    const { response, model, provider } =
      await generateAI(contents);

    console.log(`${provider} OK → ${model}`);

    const candidate = response.candidates?.[0];

    if (!candidate?.content) {
      return response.text || "AI не вернул ответ.";
    }

    contents.push(candidate.content);

    const functionCalls =
      candidate.content.parts?.filter(
        (part) => part.functionCall
      ) || [];

    if (functionCalls.length === 0) {
      const finalText = response.text || "Готово.";

      addToHistory("user", userText);
      addToHistory("model", finalText);
      finalizeLearning();

      return finalText;
    }

    const controlledByDomain = new Map();
    for (const part of functionCalls) {
      const call = part.functionCall;

      let result;

      try {
        if (isAiHistoryTool(call.name)) {
          result = await callAiHistoryTool(call.name, call.args || {});
        } else if (isAiSceneTool(call.name)) {
          result = await callAiSceneTool(
            call.name,
            call.args || {}
          );
        } else {
          const shadow = shadowEvaluateToolCall(
            call.name,
            call.args || {},
            policy,
            {
              reason: `User request: ${userText}`,
              evidence: [userText],
            }
          );
          logShadowDecision(shadow);

          const behaviorEntityIds = Array.isArray(call.args?.entity_id)
            ? call.args.entity_id
            : String(call.args?.entity_id || "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean);
          const behaviorSignal = behaviorEntityIds
            .map((entityId) => getBehaviorCorrectionSignal(entityId, call.args?.service))
            .find((signal) => signal.should_reduce_autonomy) || null;

          const evaluatedShadow =
            shadow && source === ACTION_SOURCES.AUTONOMOUS
              ? applyBehaviorDowngrade(shadow, behaviorSignal)
              : shadow;

          const enforcement = evaluatedShadow
            ? enforceActionSource(evaluatedShadow, source)
            : { authorized: true };

          if (!enforcement.authorized) {
            console.log("POLICY BLOCK →", {
              source,
              action: evaluatedShadow?.proposal?.action,
              entity_id: evaluatedShadow?.proposal?.args?.entity_id,
              outcome: evaluatedShadow?.outcome,
            });

            let pendingConfirmation = null;
            if (
              evaluatedShadow?.outcome === "confirm" &&
              actor?.userId != null &&
              actor?.chatId != null
            ) {
              pendingConfirmation = createPendingConfirmation({
                userId: actor.userId,
                chatId: actor.chatId,
                action: {
                  name: call.name,
                  args: call.args || {},
                },
              });
            }

            result = {
              blocked: true,
              outcome: evaluatedShadow?.outcome,
              reason: enforcement.reason,
              policy: evaluatedShadow?.policy,
              pending_confirmation: pendingConfirmation
                ? {
                    token: pendingConfirmation.token,
                    expiresAt: pendingConfirmation.expiresAt,
                  }
                : null,
              user_message:
                evaluatedShadow?.outcome === "confirm"
                  ? pendingConfirmation
                    ? "Действие не выполнено. Подтвердите: да или отмена."
                    : "Действие не выполнено: требуется подтверждение."
                  : evaluatedShadow?.outcome === "suggest"
                    ? "Действие не выполнено: оно доступно только как предложение."
                    : evaluatedShadow?.outcome === "deny"
                      ? "Действие запрещено политикой."
                      : "Действие не выполнено.",
            };
          } else {
            result = await callHA(
              call.name,
              call.args || {}
            );

            if (
              call.name === "ha_call_service" &&
              result?.isError !== true &&
              result?.structuredContent?.success !== false
            ) {
              const corrections = observeBehaviorAction({
                source,
                domain: call.args?.domain,
                service: call.args?.service,
                entity_id: call.args?.entity_id,
              });
              if (corrections.length) {
                console.log("Behavior correction →", corrections);
              }
            }
          }
        }
        
        if (
          call.name === "ha_call_service" &&
          call.args?.domain &&
          call.args?.entity_id &&
          !result?.isError &&
          !result?.blocked
        ) {
          const entities =
            controlledByDomain.get(call.args.domain) || [];

          entities.push(call.args.entity_id);

          controlledByDomain.set(
            call.args.domain,
            entities
          );
        }
      } catch (error) {
        console.error(
          `MCP tool ${call.name} error:`,
          error
        );

        result = {
          error: String(error),
        };
      }

      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              id: call.id,
              name: call.name,
              response: {
                result,
              },
            },
          },
        ],
      });
    }
    for (const [domain, entityIds] of controlledByDomain) {
      rememberControlledMany(domain, entityIds);

      console.log(
        `Controlled → ${domain} / ${entityIds.join(", ")}`
      );
    }
  }

  return "Не удалось завершить запрос за допустимое число шагов.";
}
