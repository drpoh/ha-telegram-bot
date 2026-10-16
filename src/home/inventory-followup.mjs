// Strict, one-turn read-only inventory follow-up. Never reinterpret actions.
export function resolveInventoryFollowup(text, previousWasInventory) {
  if (!previousWasInventory) return null;
  const match = /^а\s+(?:на|в|во)\s+([а-яёa-z0-9 _-]+)\s*\??$/iu.exec(String(text ?? "").trim());
  const room = match?.[1]?.trim();
  if (!room || room.length > 120) return null;
  return `Какие устройства в ${room}?`;
}
