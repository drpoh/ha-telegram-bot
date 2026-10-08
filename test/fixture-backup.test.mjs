import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync,writeFileSync,symlinkSync,copyFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {execFileSync} from "node:child_process";
import {backupFixtureSqlite,verifyFixtureBackup,restoreFixtureSqlite} from "../src/backup/fixture-sqlite.mjs";

test("SQLite snapshot is consistent, verifiable and never overwrites",()=>{
 const root=mkdtempSync(join(tmpdir(),"bot-backup-fixture-"));
 try{
  const src=join(root,"source.db"),dest=join(root,"backup.db");
  execFileSync("sqlite3",[src,"CREATE TABLE items (value TEXT); INSERT INTO items VALUES ('sample'); PRAGMA user_version=7;"]);
  const manifest=backupFixtureSqlite({source:src,destination:dest,sandboxRoot:root});
  assert.equal(manifest.format_version,1);
  assert.equal(manifest.schema_version,7);
  assert.equal(verifyFixtureBackup({file:dest,sandboxRoot:root,manifest}),true);
  assert.throws(()=>backupFixtureSqlite({source:src,destination:dest,sandboxRoot:root}),/destination_exists/);
  const broken=join(root,"broken.db");copyFileSync(dest,broken);writeFileSync(broken,"corrupt");
  assert.equal(verifyFixtureBackup({file:broken,sandboxRoot:root,manifest}),false);
  assert.throws(()=>backupFixtureSqlite({source:src,destination:join(tmpdir(),"escape.db"),sandboxRoot:root}),/path_outside_sandbox/);
  symlinkSync(src,join(root,"alias.db"));
  assert.throws(()=>backupFixtureSqlite({source:join(root,"alias.db"),destination:join(root,"other.db"),sandboxRoot:root}),/invalid_source/);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test("sandbox restore enforces integrity, schema and exclusive target",()=>{
 const root=mkdtempSync(join(tmpdir(),"bot-restore-fixture-"));
 try{
  const src=join(root,"original.db"),backup=join(root,"backup.db"),restored=join(root,"restored.db");
  execFileSync("sqlite3",[src,"CREATE TABLE example (id INTEGER); INSERT INTO example VALUES (73); PRAGMA user_version=4;"]);
  const manifest=backupFixtureSqlite({source:src,destination:backup,sandboxRoot:root});
  assert.throws(()=>restoreFixtureSqlite({backup,destination:restored,sandboxRoot:root,manifest,maxSchemaVersion:3}),/incompatible_schema/);
  assert.equal(restoreFixtureSqlite({backup,destination:restored,sandboxRoot:root,manifest,maxSchemaVersion:4}).restored,true);
  assert.equal(execFileSync("sqlite3",["-readonly",restored,"SELECT id FROM example;"],{encoding:"utf8"}).trim(),"73");
  assert.throws(()=>restoreFixtureSqlite({backup,destination:restored,sandboxRoot:root,manifest,maxSchemaVersion:4}),/EEXIST/);
  assert.throws(()=>restoreFixtureSqlite({backup,destination:join(tmpdir(),"escape-restore.db"),sandboxRoot:root,manifest,maxSchemaVersion:4}),/path_outside_sandbox/);
  assert.throws(()=>restoreFixtureSqlite({backup,destination:join(root,"bad.db"),sandboxRoot:root,manifest:{...manifest,sha256:"0".repeat(64)},maxSchemaVersion:4}),/backup_verification_failed/);
  symlinkSync(restored,join(root,"symlink-restore.db"));
  assert.throws(()=>restoreFixtureSqlite({backup,destination:join(root,"symlink-restore.db"),sandboxRoot:root,manifest,maxSchemaVersion:4}),/EEXIST/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
