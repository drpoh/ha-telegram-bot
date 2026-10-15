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
import { resolveKnownDevice, getKnownDevices } from "../home/entity-resolver.mjs";
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
import { checkAutonomyBudget, commitAutonomousAction } from "../policy/autonomy-budget.mjs";
import { createPendingConfirmation } from "../decision/pending-confirmation.mjs";
import { completeDecisionAudit, failDecisionAudit, recordDecisionPrecondition, rememberDecisionAudit } from "../decision/audit.mjs";
import { checkActionPreconditions, checkContextPreconditions } from "../decision/preconditions.mjs";
import { traceDecision } from "../decision/trace.mjs";
import { checkRequestScope } from "../decision/request-scope.mjs";
import { checkAgentAreaLightScope } from "../decision/agent-area-guard.mjs";
import { fileURLToPath } from "node:url";
import { checkBathroomLightAction } from "../decision/bathroom-light-guard.mjs";
import { getOperationalContextForEntity } from "../memory/operational.mjs";
import {
  getBehaviorCorrectionSignal,
  observeBehaviorAction,
} from "../learning/corrections.mjs";

const LOCAL_LIGHTING_MAP = fileURLToPath(new URL("../../config/lighting-classification.local.json", import.meta.url));
const MAX_AGENT_STEPS = 10;

export function shouldObserveBehaviorAction(source, verificationStatus) {
  return source !== ACTION_SOURCES.AUTONOMOUS || verificationStatus === "confirmed";
}

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
  const requestDevice = resolveKnownDevice(userText);
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
      let activeDecisionAuditId = null;

      try {
        if (isAiHistoryTool(call.name)) {
          result = await callAiHistoryTool(call.name, call.args || {});
        } else if (isAiSceneTool(call.name)) {
          result = await callAiSceneTool(
            call.name,
            call.args || {},
            { source, userText }
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

          const scope = checkRequestScope({ userText, device: requestDevice, devices: Object.values(getKnownDevices()), toolName: call.name, args: call.args });
          const bathroomGuard = scope.allowed
            ? await checkBathroomLightAction({
                userText, toolName: call.name, args: call.args || {},
                callTool: (name, args) => callHA(name, args),
              })
            : { allowed: false, status: "request_scope_blocked" };
          const areaGuard = scope.allowed && bathroomGuard.allowed
            ? await checkAgentAreaLightScope({
                userText, toolName: call.name, args: call.args || {},
                configPath: LOCAL_LIGHTING_MAP,
                callTool: (name, args) => callHA(name, args),
              })
            : { allowed: false, status: "previous_scope_blocked" };
          const authorized = enforcement.authorized && scope.allowed && bathroomGuard.allowed && areaGuard.allowed;
          const decisionAudit = evaluatedShadow
            ? rememberDecisionAudit({
                shadow: evaluatedShadow,
                source,
                authorized,
              })
            : null;
          activeDecisionAuditId = decisionAudit?.id || null;
          traceDecision("policy", {
            source,
            action: evaluatedShadow?.proposal?.action,
            entity_id: evaluatedShadow?.proposal?.args?.entity_id,
            risk: evaluatedShadow?.policy?.risk,
            policy: evaluatedShadow?.policy?.level,
            outcome: evaluatedShadow?.outcome,
          });

          if (!authorized) {
            console.log("POLICY BLOCK →", {
              source,
              action: evaluatedShadow?.proposal?.action,
              entity_id: evaluatedShadow?.proposal?.args?.entity_id,
              outcome: evaluatedShadow?.outcome,
            });

            let pendingConfirmation = null;
            if (
              scope.allowed &&
              bathroomGuard.allowed &&
              areaGuard.allowed &&
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
              outcome: !scope.allowed ? "request_scope_blocked" : !bathroomGuard.allowed ? "bathroom_scope_blocked" : !areaGuard.allowed ? "area_scope_blocked" : evaluatedShadow?.outcome,
              reason: !scope.allowed ? "Tool target exceeds the known single-device request" : !bathroomGuard.allowed ? bathroomGuard.status : !areaGuard.allowed ? areaGuard.status : enforcement.reason,
              policy: evaluatedShadow?.policy,
              pending_confirmation: pendingConfirmation
                ? {
                    token: pendingConfirmation.token,
                    expiresAt: pendingConfirmation.expiresAt,
                  }
                : null,
              user_message:
                !scope.allowed ? (scope.status === "multi_target_unresolved"
                  ? "Групповая команда не выполнена: состав устройств ещё не подтверждён. Укажите одно устройство или помещение за раз."
                  : "Действие не выполнено: устройство не соответствует исходному запросу.") :
                !bathroomGuard.allowed ? "Действие не выполнено: свет ванной или его принадлежность помещению не подтверждены." :
                !areaGuard.allowed ? "Групповое управление светом заблокировано: состав помещения или разрешённые устройства не подтверждены." :
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
            let precondition = null;
            if (
              call.name === "ha_call_service" &&
              ["turn_on", "turn_off"].includes(call.args?.service)
            ) {
              const readState = (entityId) => callHA("ha_get_state", { entity_id: entityId });
              const targetPrecondition = await checkActionPreconditions({
                ...call.args,
                readState,
              });
              const contextPrecondition = targetPrecondition.allowed
                ? await checkContextPreconditions(
                    evaluatedShadow?.policy?.preconditions,
                    { readState }
                  )
                : null;
              precondition = contextPrecondition?.allowed === false
                ? {
                    ...contextPrecondition,
                    target: targetPrecondition,
                    context: contextPrecondition,
                  }
                : {
                    ...targetPrecondition,
                    target: targetPrecondition,
                    context: contextPrecondition,
                  };
              if (decisionAudit?.id) {
                recordDecisionPrecondition(decisionAudit.id, precondition);
              }
            }

            if (precondition) traceDecision("precondition", { status: precondition.status, entity_id: call.args?.entity_id });
            const autonomyBudget = source === ACTION_SOURCES.AUTONOMOUS && call.name === "ha_call_service" && (!precondition || precondition.allowed === true) ? checkAutonomyBudget(call.args || {}) : null;
            if (autonomyBudget) traceDecision("budget", { status: autonomyBudget.allowed ? "ready" : "blocked", reason: autonomyBudget.reason, entity_id: call.args?.entity_id });

            if (autonomyBudget && autonomyBudget.allowed !== true) {
              result = {
                blocked: true,
                outcome: "autonomy_budget_blocked",
                autonomy_budget: autonomyBudget,
                user_message: "Автономное действие не выполнено: сработала защита от повтора или ограничения частоты.",
              };
            } else if (precondition && precondition.allowed !== true) {
              result = {
                blocked: true,
                outcome: precondition.status === "noop" ? "noop" : "precondition_blocked",
                precondition,
                user_message:
                  precondition.status === "noop"
                    ? "Действие не требуется: Home Assistant уже в нужном состоянии."
                    : "Автономное действие не выполнено: precondition не подтвержден свежим состоянием Home Assistant.",
              };
            } else {
              if (source === ACTION_SOURCES.AUTONOMOUS && call.name === "ha_call_service") {
                commitAutonomousAction(call.args || {});
              }
              traceDecision("act", { action: evaluatedShadow?.proposal?.action, entity_id: call.args?.entity_id, status: "execute" });
              result = await callHA(
                call.name,
                call.args || {}
              );
              traceDecision("verify", { entity_id: call.args?.entity_id, verification: result?.verification?.status ?? "unsupported" });

              if (decisionAudit?.id) {
                completeDecisionAudit(decisionAudit.id, { result });
              }
            }

            if (
              call.name === "ha_call_service" &&
              result?.blocked !== true &&
              result?.isError !== true &&
              result?.structuredContent?.success !== false
            ) {
              const verificationStatus = result?.verification?.status ?? null;
              const shouldObserveBehavior = shouldObserveBehaviorAction(
                source,
                verificationStatus
              );

              if (shouldObserveBehavior) {
                const corrections = observeBehaviorAction({
                  source,
                  domain: call.args?.domain,
                  service: call.args?.service,
                  entity_id: call.args?.entity_id,
                });
                if (corrections.length) {
                  console.log("Behavior correction →", corrections);
                }
              } else {
                console.log("Behavior learning skipped →", {
                  source,
                  verification: verificationStatus || "unsupported",
                  entity_id: call.args?.entity_id,
                });
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
        if (activeDecisionAuditId) failDecisionAudit(activeDecisionAuditId, error);
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
