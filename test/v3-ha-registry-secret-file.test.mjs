import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,chmod,symlink,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readProtectedRegistrySecret} from '../src/decision/v3-ha-registry-secret-file.mjs';
test('private regular file reads; permissive modes and symlinks reject',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'registry-secret-test-'));
 try{
  const file=join(dir,'token');await writeFile(file,'fixture-secret-value-123',{mode:0o600});await chmod(file,0o600);
  assert.equal(await readProtectedRegistrySecret({path:file}),'fixture-secret-value-123');
  await chmod(file,0o640);await assert.rejects(readProtectedRegistrySecret({path:file}));
  await chmod(file,0o600);const link=join(dir,'link');await symlink(file,link);
  await assert.rejects(readProtectedRegistrySecret({path:link}));
  await assert.rejects(readProtectedRegistrySecret({path:file,ownerUid:process.getuid()+1}));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('invalid configuration and whitespace tokens reject',async()=>{
 await assert.rejects(readProtectedRegistrySecret({path:'relative'}));
 const dir=await mkdtemp(join(tmpdir(),'registry-secret-test-'));
 try{const file=join(dir,'token');await writeFile(file,'bad fixture token value',{mode:0o600});
  await assert.rejects(readProtectedRegistrySecret({path:file}));
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('unsafe parent folders and symlink ancestors are denied',async()=>{
 const root=await mkdtemp(join(tmpdir(),'registry-ancestor-'));
 try{
  const safe=join(root,'safe');await mkdir(safe,{mode:0o700});
  const file=join(safe,'token');await writeFile(file,'fixture-credential-098765',{mode:0o600});
  assert.equal(await readProtectedRegistrySecret({path:file}),'fixture-credential-098765');
  await chmod(safe,0o777);
  await assert.rejects(readProtectedRegistrySecret({path:file}),/untrusted_secret_parent/);
  await chmod(safe,0o700);
  const link=join(root,'link');await symlink(safe,link);
  await assert.rejects(readProtectedRegistrySecret({path:join(link,'token')}),/untrusted_secret_parent/);
 }finally{await rm(root,{recursive:true,force:true});}
});
