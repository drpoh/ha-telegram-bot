import { connectMcp, closeMcp } from "../../src/mcp/client.mjs";

// Inspect only structural response metadata. Never print home/device identifiers.
function shape(value) {
  if (Array.isArray(value)) return { kind: "array", length: value.length, itemKeys: Object.keys(value[0] ?? {}) };
  if (!value || typeof value !== "object") return { kind: typeof value };
  return { kind: "object", keys: Object.keys(value), nested: Object.fromEntries(Object.entries(value).filter(([,v]) => v && typeof v === "object").slice(0, 6).map(([k,v]) => [k, Array.isArray(v) ? { kind: "array", length: v.length, itemKeys: Object.keys(v[0] ?? {}) } : { kind: "object", keys: Object.keys(v) }])) };
}
try {
  const client = await connectMcp();
  for (const [name,args] of [
    ["ha_list_floors_areas", {}],
    ["ha_get_device", { limit: 1, offset: 0, detail_level: "minimal" }],
    ["ha_search", { query: "датчик движения", limit: 1, offset: 0, result_fields: ["entity_id"] }],
  ]) {
    try {
      const response = await client.callTool({ name, arguments: args });
      console.log(JSON.stringify({ tool: name, isError: !!response.isError, shape: shape(response.structuredContent), contentKinds: (response.content ?? []).map(c => c.type) }));
    } catch (error) {
      console.log(JSON.stringify({tool:name, status:"failed", errorType:error?.name ?? "Error"}));
    }
  }
  console.log("REGISTRY_SHAPE_PROBE=COMPLETE");
} finally {
  await closeMcp();
}
