import { askHomeAssistant } from "../ai/agent.mjs";

let requestQueue = Promise.resolve();
let requestNumber = 0;
let pendingRequests = 0;
let activeRequests = 0;

export function queueHomeAssistantRequest(userText) {
  const id = ++requestNumber;
  pendingRequests++;

  console.log(`Queue #${id} → ${userText}`);

  const request = requestQueue.then(async () => {
    console.log(`Queue #${id} START`);
    pendingRequests--;
    activeRequests++;

    try {
      return await askHomeAssistant(userText);
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
export function getQueueStatus() {
  return {
    active: activeRequests,
    pending: pendingRequests,
    total: requestNumber,
  };
}
