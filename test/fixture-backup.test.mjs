import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync,writeFileSync,symlinkSync,copyFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {execFileSync,spawn} from "node:child_process";
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

test("live WAL writer: snapshot excludes uncommitted transaction and remains consistent",async()=>{
 const root=mkdtempSync(join(tmpdir(),"bot-wal-fixture-"));
 let child;
 try{
  const source=join(root,"live.db"),first=join(root,"before.db"),second=join(root,"after.db");
  execFileSync("sqlite3",[source,"PRAGMA journal_mode=WAL; CREATE TABLE events(value INTEGER); INSERT INTO events VALUES(1);"]);
  child=spawn("sqlite3",["-batch",source],{stdio:["pipe","pipe","pipe"]});
  const ready=new Promise((resolve,reject)=>{
   let output="";
   const timer=setTimeout(()=>reject(Error("WAL fixture writer timeout")),4000);
   child.stdout.on("data",chunk=>{output+=chunk; if(output.includes("writer_ready")){clearTimeout(timer);resolve();}});
   child.once("error",reject);
   child.once("exit",code=>{if(!output.includes("writer_ready"))reject(Error("WAL writer exited "+code));});
  });
  child.stdin.write("PRAGMA busy_timeout=5000; BEGIN IMMEDIATE; INSERT INTO events VALUES(2); SELECT 'writer_ready';\n");
  await ready;
  const manifest=backupFixtureSqlite({source,destination:first,sandboxRoot:root});
  assert.equal(verifyFixtureBackup({file:first,sandboxRoot:root,manifest}),true);
  assert.equal(execFileSync("sqlite3",["-readonly",first,"SELECT group_concat(value,',') FROM events;"],{encoding:"utf8"}).trim(),"1");
  child.stdin.write("COMMIT;\n");
  child.stdin.end();
  await new Promise((resolve,reject)=>{child.once("exit",code=>code===0?resolve():reject(Error("writer exited "+code)));});
  child=null;
  const after=backupFixtureSqlite({source,destination:second,sandboxRoot:root});
  assert.equal(verifyFixtureBackup({file:second,sandboxRoot:root,manifest:after}),true);
  assert.equal(execFileSync("sqlite3",["-readonly",second,"SELECT group_concat(value,',') FROM events;"],{encoding:"utf8"}).trim(),"1,2");
 }finally{if(child)child.kill();rmSync(root,{recursive:true,force:true});}
});
test("failed backup removes only its own destination, leaving source untouched",()=>{
 const root=mkdtempSync(join(tmpdir(),"bot-failed-fixture-"));
 try{
  const source=join(root,"corrupt.db"),destination=join(root,"partial.db");
  writeFileSync(source,"not a SQLite database");
  assert.throws(()=>backupFixtureSqlite({source,destination,sandboxRoot:root}),/source_integrity_failed|SQLITE|database/);
  assert.equal(verifyFixtureBackup({file:destination,sandboxRoot:root,manifest:{format_version:1,sha256:"0".repeat(64),size_bytes:0,schema_version:0}}),false);
  assert.equal(execFileSync("cat",[source],{encoding:"utf8"}),"not a SQLite database");
 }finally{rmSync(root,{recursive:true,force:true});}
});
