import PQueue from "p-queue";
import { askHomeAssistant } from "../ai/agent.mjs";
import { callHA } from "../mcp/executor.mjs";
import { answerV2ReadonlyFastPath } from "../telegram/readonly-fast-path.mjs";
import {
  cancelPendingConfirmation,
  consumePendingConfirmation,
  peekPendingConfirmation,
} from "../decision/pending-confirmation.mjs";

// A single queue serializes AI queries and physical-confirmation requests.
// Never let a queued command bypass the independent policy/consent checks below.
const requestQueue = new PQueue({concurrency: 1});
let requestNumber = 0;

function enqueue(label, handler) {
  const id = ++requestNumber;
  console.log(`Queue #${id} → ${label}`);
  return requestQueue.add(async () => {
    // Match the former Promise-chain async boundary: cancellation immediately
    // after queueing must be observed before authorization begins.
    await Promise.resolve();
    console.log(`Queue #${id} START`);
    try {
      return await handler();
    } finally {
      console.log(`Queue #${id} DONE`);
    }
  });
}

export function queueHomeAssistantRequest(userText, options = {}) {
  // Keep fast reads on the SAME single-worker queue as existing AI requests
  // and confirmation handling; they must never race with action execution.
  const {readonlyFastPath=false,...agentOptions}=options;
  return enqueue(userText, async () => {
    if(readonlyFastPath===true){
      const fast=await answerV2ReadonlyFastPath({text:userText});
      if(fast.handled===true)return fast.text;
    }
    return askHomeAssistant(userText, agentOptions);
  });
}

export function queueConfirmedAction(
  { userId, chatId },
  { execute = callHA, authorize = null, authorizationTimeoutMs = 3000 } = {}
) {
  return enqueue("confirmed pending action", async () => {
    const pending = peekPendingConfirmation({ userId, chatId });
    if (!pending) return { status: "missing" };

    // Confirmation is consent, not an authorization grant. The stored action
    // must pass the shared live policy/scope gate immediately before execution.
    // Until the gate is wired, fail closed without consuming or executing it.
    if (typeof authorize !== "function") return { status: "authorization_unavailable" };
    let authorized = false;
    if (!Number.isFinite(authorizationTimeoutMs) || authorizationTimeoutMs <= 0 || authorizationTimeoutMs > 30000) return { status: "authorization_denied" };
    let timeoutId;
    try {
      authorized = (await Promise.race([
        Promise.resolve().then(() => authorize(pending.action, { userId, chatId })),
        new Promise(resolve => { timeoutId = setTimeout(() => resolve(false), authorizationTimeoutMs); }),
      ])) === true;
    } catch { authorized = false; }
    finally { clearTimeout(timeoutId); }
    if (!authorized) return { status: "authorization_denied" };

    const consumed = consumePendingConfirmation({
      userId,
      chatId,
      token: pending.token,
    });
    if (!consumed) return { status: "expired" };

    const result = await execute(consumed.action.name, consumed.action.args);
    const verificationStatus = result?.verification?.status ?? null;
    return {
      status: result?.isError
        ? "error"
        : verificationStatus === "failed"
          ? "failed"
          : verificationStatus === "pending"
            ? "pending"
            : verificationStatus === "confirmed"
              ? "executed"
              : "accepted",
      action: consumed.action,
      result,
    };
  });
}

export function cancelQueuedConfirmation({ userId, chatId }) {
  return cancelPendingConfirmation({ userId, chatId });
}

export function getQueueStatus() {
  return {
    active: requestQueue.pending,
    pending: requestQueue.size,
    total: requestNumber,
  };
}
