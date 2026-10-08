import {
  listAiScenes,
} from "./store.mjs";
import { resolveArea } from "../home/area-resolver.mjs";

export function isAiSceneTool(name) {
  return [
    "ai_scene_capture",
    "ai_scene_run",
    "ai_scene_list",
    "ai_scene_delete",
  ].includes(name);
}

async function resolveRequiredArea(areaText) {
  const area = await resolveArea(areaText);

  if (!area) {
    throw new Error(
      `Home Assistant area not found: ${areaText}`
    );
  }

  return area;
}

export async function callAiSceneTool(
  name,
  args = {}
) {
  console.log(`AI Scene → ${name}`, args);

  if (name === "ai_scene_capture" || name === "ai_scene_run" || name === "ai_scene_delete") {
    // Scene mutations and playback require an independent trusted area scope,
    // per-action policy, and explicit authorization. Never use the direct
    // scene manager path to bypass the shared agent safety checks.
    return {
      success: false,
      blocked: true,
      outcome: "scene_operation_not_authorized",
      user_message: "Операция с AI-сценой временно недоступна до подключения безопасной проверки действий.",
    };
  }

  if (name === "ai_scene_list") {
    const area = await resolveRequiredArea(
      args.area
    );

    const scenes = listAiScenes(area.area_id);

    return {
      success: true,
      area_id: area.area_id,
      area_name: area.name,
      scenes: scenes.map((scene) => ({
        name: scene.name,
        entities: scene.entities.length,
      })),
    };
  }

  throw new Error(
    `Unknown AI scene tool: ${name}`
  );
}
