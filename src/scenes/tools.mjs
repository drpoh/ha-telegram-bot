import {
  listAiScenes,
  getAiScene,
  deleteAiScene,
} from "./store.mjs";
import { resolveArea } from "../home/area-resolver.mjs";
import { captureAiScene } from "./capture.mjs";
import { planAiSceneOperation } from "./safe-scene-plan.mjs";
import { applyVerifiedLightScene } from "./verified-run.mjs";
import { callHA } from "../mcp/executor.mjs";
import { explicitSceneAreaMention } from "./room-mention.mjs";

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
  args = {},
  context = {}
) {
  console.log(`AI Scene → ${name}`, args);

  if (name === "ai_scene_capture" || name === "ai_scene_run" || name === "ai_scene_delete") {
    // This entrypoint is intentionally non-executable without trusted caller context.
    // In particular the model cannot assert source=user_explicit itself.
    if (context.source !== "user_explicit" || typeof context.userText !== "string") {
      return { success: false, blocked: true, outcome: "scene_operation_not_authorized" };
    }
    // Scope is resolved independently from the original user request,
    // not from a room proposed by the model. Russian case variants are
    // handled by resolveArea; ambiguous or unnamed rooms fail closed.
    const normalize = (v) => String(v || "").toLocaleLowerCase("ru-RU").replace(/ё/g,"е").trim();
    if (!args.name || !args.area || !normalize(context.userText).includes(normalize(args.name))) {
      return { success:false, blocked:true, outcome:"scene_identity_unconfirmed" };
    }
    const area = await resolveRequiredArea(args.area);
    if (!explicitSceneAreaMention(context.userText, area.name))
      return { success:false, blocked:true, outcome:"scene_area_unconfirmed" };
    const trustedArea = { ...area, requestedArea: args.area };
    const scene = name === "ai_scene_capture" ? null : getAiScene(args.name, area.area_id);
    const decision = await planAiSceneOperation({
      toolName:name, args, source:context.source, area:trustedArea, scene,
      callTool: (tool, data) => callHA(tool, data)
    });
    if (!decision.allowed) return { success:false, blocked:true, outcome:decision.status };
    if (name === "ai_scene_capture") return captureAiScene(args.name, area.area_id);
    if (name === "ai_scene_delete") {
      const deleted = deleteAiScene(args.name, area.area_id);
      return { success:deleted, deleted, name:args.name, area_id:area.area_id };
    }
    // Only simple lighting scenes are executable; unsupported legacy domains fail closed.
    return applyVerifiedLightScene(scene, (tool, data) => callHA(tool, data));
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
