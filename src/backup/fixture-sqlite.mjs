import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, statSync, realpathSync } from "node:fs";
import { resolve, dirname, sep } from "node:path";

// Explicit sandbox boundary: no production database or arbitrary restore targets.
function within(root, file) {
 const base=realpathSync(root);
 const target=resolve(file);
 if(!target.startsWith(base+sep)) throw Error("path_outside_sandbox");
 if(realpathSync(dirname(target))!==base) throw Error("sandbox_directory_unverified");
 return target;
}
function sqlite(db, query) {
 return execFileSync("sqlite3",["-readonly",db,query],{encoding:"utf8"}).trim();
}
export function backupFixtureSqlite({source,destination,sandboxRoot}={}){
 if(!sandboxRoot || !source || !destination) throw Error("missing_sandbox_paths");
 const src=within(sandboxRoot,source),dest=within(sandboxRoot,destination);
 if(src===dest || statSync(src).isFile()!==true) throw Error("invalid_source");
 try{statSync(dest);throw Error("destination_exists");}catch(e){if(e.code!=="ENOENT")throw e;}
 if(sqlite(src,"PRAGMA integrity_check;")!=="ok")throw Error("source_integrity_failed");
 const escaped=dest.replaceAll("'","''");
 execFileSync("sqlite3",[src,`.backup '${escaped}'`],{encoding:"utf8"});
 if(sqlite(dest,"PRAGMA integrity_check;")!=="ok")throw Error("backup_integrity_failed");
 const bytes=readFileSync(dest);
 return {format_version:1,sha256:createHash("sha256").update(bytes).digest("hex"),
   size_bytes:bytes.length,schema_version:Number(sqlite(dest,"PRAGMA user_version;"))};
}
export function verifyFixtureBackup({file,sandboxRoot,manifest}={}){
 try{
  if(manifest?.format_version!==1 || !/^[a-f0-9]{64}$/.test(manifest.sha256))return false;
  const path=within(sandboxRoot,file),bytes=readFileSync(path);
  if(bytes.length!==manifest.size_bytes || createHash("sha256").update(bytes).digest("hex")!==manifest.sha256)return false;
  return sqlite(path,"PRAGMA integrity_check;")==="ok" &&
   Number(sqlite(path,"PRAGMA user_version;"))===manifest.schema_version;
 }catch{return false;}
}
