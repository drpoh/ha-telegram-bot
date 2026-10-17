// Read-only, bounded HA-MCP device inventory by a verified HA area_id.
// This is not an entity-registry inventory.
export async function listAreaDevices(areaId, callTool, { pageSize = 50, maxPages = 20 } = {}) {
  if (typeof areaId !== "string" || !areaId.trim()) throw new Error("area_id required");
  if (typeof callTool !== "function") throw new TypeError("callTool required");
  const devices = [];
  let offset = 0;
  for (let page = 0; page < maxPages; page++) {
    const response = await callTool("ha_get_device", { area_id: areaId, limit: pageSize, offset });
    const data = response?.structuredContent ?? response;
    if (response?.isError || data?.success !== true || !Array.isArray(data.devices)) {
      return { complete: false, devices, reason: "invalid_page" };
    }
    if (data.offset !== offset || data.count !== data.devices.length) {
      return { complete: false, devices, reason: "inconsistent_page" };
    }
    if (data.devices.some(device => device.area_id !== areaId)) {
      return { complete: false, devices, reason: "area_mismatch" };
    }
    devices.push(...data.devices);
    if (data.has_more === false && Number.isSafeInteger(data.total_count) && devices.length === data.total_count) {
      return { complete: true, devices, reason: "complete" };
    }
    const next = data.next_offset;
    if (!Number.isSafeInteger(next) || next <= offset || next !== offset + data.devices.length) {
      return { complete: false, devices, reason: "invalid_pagination" };
    }
    offset = next;
  }
  return { complete: false, devices, reason: "page_cap" };
}
