import { captureAiScene } from "./capture.mjs";
import { runAiScene } from "./manager.mjs";
import {
  listAiScenes,
  deleteAiScene,
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

  if (name === "ai_scene_capture") {
    return captureAiScene(
      args.name,
      args.area
    );
  }

  if (name === "ai_scene_run") {
    const area = await resolveRequiredArea(
      args.area
    );

    const result = await runAiScene(
      args.name,
      area.area_id
    );

    return {
      ...result,
      area_id: area.area_id,
      area_name: area.name,
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

  if (name === "ai_scene_delete") {
    const area = await resolveRequiredArea(
      args.area
    );

    const deleted = deleteAiScene(
      args.name,
      area.area_id
    );

    return {
      success: deleted,
      deleted,
      name: args.name,
      area_id: area.area_id,
      area_name: area.name,
    };
  }

  throw new Error(
    `Unknown AI scene tool: ${name}`
  );
}
