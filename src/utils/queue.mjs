import { askHomeAssistant } from "../ai/agent.mjs";
import { callHA } from "../mcp/executor.mjs";
import {
  cancelPendingConfirmation,
  consumePendingConfirmation,
  peekPendingConfirmation,
} from "../decision/pending-confirmation.mjs";

let requestQueue = Promise.resolve();
let requestNumber = 0;
let pendingRequests = 0;
let activeRequests = 0;

function enqueue(label, handler) {
  const id = ++requestNumber;
  pendingRequests++;
  console.log(`Queue #${id} → ${label}`);

  const request = requestQueue.then(async () => {
    console.log(`Queue #${id} START`);
    pendingRequests--;
    activeRequests++;
    try {
      return await handler();
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
  return enqueue(userText, () => askHomeAssistant(userText, options));
}

export function queueConfirmedAction(
  { userId, chatId },
  { execute = callHA } = {}
) {
  return enqueue("confirmed pending action", async () => {
    const pending = peekPendingConfirmation({ userId, chatId });
    if (!pending) return { status: "missing" };

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
  };
}
