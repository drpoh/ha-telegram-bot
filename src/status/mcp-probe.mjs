// Read-only MCP-to-Home-Assistant probe. Does not execute services or mutate HA.
export async function probeMcp({ client, timeoutMs = 5000, entityId = "sensor.sauna_te_sauna_temperature" } = {}) {
  if (!client || typeof client.callTool !== "function") return { status: "disconnected" };
  const started = Date.now();
  try {
    const result = await client.callTool(
      { name: "ha_get_state", arguments: { entity_id: entityId } },
      undefined,
      { timeout: timeoutMs }
    );
    const data = result?.structuredContent?.data;
    if (result?.isError || !data || data.entity_id !== entityId || typeof data.state !== "string") {
      return { status: "unverified" };
    }
    return { status: "ok", latencyMs: Date.now() - started };
  } catch (error) {
    return { status: "error", reason: /timeout|timed out/i.test(String(error?.message)) ? "timeout" : "request_failed" };
  }
}
