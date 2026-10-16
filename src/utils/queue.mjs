import { askHomeAssistant } from "../ai/agent.mjs";
import { callHA } from "../mcp/executor.mjs";
import { replyToRoomInventory } from "../home/room-inventory-reply.mjs";
import { resolveInventoryFollowup } from "../home/inventory-followup.mjs";
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
const inventoryContext = new Map();

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
    const actor = options.actor;
    const contextKey = actor?.userId != null && actor?.chatId != null
      ? `${actor.userId}:${actor.chatId}` : null;
    const previous = contextKey ? inventoryContext.get(contextKey) === true : false;
    if (contextKey) inventoryContext.delete(contextKey);
    const inventoryText = resolveInventoryFollowup(userText, previous) ?? userText;
    const inventory = await replyToRoomInventory(inventoryText, callHA);
    if (inventory !== null) {
      if (contextKey) inventoryContext.set(contextKey, true);
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
    inventoryContext.delete(`${userId}:${chatId}`);
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
  inventoryContext.delete(`${userId}:${chatId}`);
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
