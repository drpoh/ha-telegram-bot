import { askHomeAssistant } from "../ai/agent.mjs";

let requestQueue = Promise.resolve();
let requestNumber = 0;

export function queueHomeAssistantRequest(userText) {
  const id = ++requestNumber;

  console.log(`Queue #${id} → ${userText}`);

  const request = requestQueue.then(async () => {
    console.log(`Queue #${id} START`);

    try {
      return await askHomeAssistant(userText);
    } finally {
      console.log(`Queue #${id} DONE`);
    }
  });

  requestQueue = request.catch((error) => {
    console.error(`Queue #${id} ERROR:`, error);
  });

  return request;
}
