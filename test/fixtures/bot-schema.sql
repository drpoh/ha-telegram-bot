-- Sanitized empty database schema for isolated tests. No runtime data.
CREATE TABLE memory (
 key TEXT PRIMARY KEY,
 value TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE devices (
 alias TEXT PRIMARY KEY,
 entity_id TEXT NOT NULL,
 domain TEXT,
 friendly_name TEXT,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE conversation (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 role TEXT NOT NULL,
 text TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_conversation_created ON conversation(created_at);
CREATE TABLE learned_devices (
 alias TEXT PRIMARY KEY,
 entity_id TEXT NOT NULL,
 domain TEXT NOT NULL,
 friendly_name TEXT,
 use_count INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_learned_entity ON learned_devices(entity_id);
CREATE TABLE ai_scenes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 normalized_name TEXT NOT NULL,
 area_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(normalized_name, area_id)
);
CREATE TABLE ai_scene_entities (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scene_id INTEGER NOT NULL,
 entity_id TEXT NOT NULL,
 domain TEXT NOT NULL,
 state TEXT NOT NULL,
 attributes TEXT NOT NULL DEFAULT '{}',
 UNIQUE(scene_id, entity_id),
 FOREIGN KEY(scene_id) REFERENCES ai_scenes(id) ON DELETE CASCADE
);
CREATE INDEX idx_ai_scene_entities_scene_id ON ai_scene_entities(scene_id);
CREATE INDEX idx_ai_scenes_normalized_name ON ai_scenes(normalized_name);
CREATE INDEX idx_ai_scenes_area_id ON ai_scenes(area_id);
