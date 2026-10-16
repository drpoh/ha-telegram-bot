import { askHomeAssistant } from "../ai/agent.mjs";
import { callHA } from "../mcp/executor.mjs";
import { replyToRoomInventory } from "../home/room-inventory-reply.mjs";
import {
  cancelPendingConfirmation,
  consumePendingConfirmation,
  peekPendingConfirmation,
} from "../decision/pending-confirmation.mjs";

let requestQueue = Promise.resolve();
let requestNumber = 0;
let pendingRequests = 0;
let activeRequests = 0;
let lastRequest = null;
let lastWasRoomInventory = false;

function enqueue(label, handler) {
  const id = ++requestNumber;
  pendingRequests++;
  console.log(`Queue #${id} → ${label}`);

  const request = requestQueue.then(async () => {
    console.log(`Queue #${id} START`);
    pendingRequests--;
    activeRequests++;
    const started = Date.now();
    try {
      const answer = await handler();
      lastRequest = { status: 'ok', at: Date.now(), durationMs: Date.now()-started };
      return answer;
    } catch (error) {
      lastRequest = { status: 'error', at: Date.now(), durationMs: Date.now()-started };
      throw error;
    } finally {
      activeRequests--;
      console.log(`Queue #${id} DONE`);
    }
  });

  requestQueue = request.catch((error) => {
    console.error(`Queue #${id} ERROR:`, error);
  });

  return request;
}

export function queueHomeAssistantRequest(userText, options = {}) {
  return enqueue(userText, async () => {
    const followup = /^а\s+(?:на|в|во)\s+([а-яё\w -]+)\??$/iu.exec(String(userText).trim());
    const inventoryText = lastWasRoomInventory && followup
      ? `Какие устройства в ${followup[1]}?`
      : userText;
    lastWasRoomInventory = false;
    const inventory = await replyToRoomInventory(inventoryText, callHA);
    if (inventory !== null) {
      lastWasRoomInventory = true;
      return inventory;
    }
    return askHomeAssistant(userText, options);
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
    active: activeRequests,
    pending: pendingRequests,
    total: requestNumber,
    lastRequest: lastRequest ? { ...lastRequest } : null,
  };
}
