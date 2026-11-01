import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { bundledManifest, firefoxManifest } from '../scripts/build.mjs';

const base = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url)));
const chromeID = (m) => [...createHash('sha256').update(Buffer.from(m.key, 'base64')).digest('hex').slice(0, 32)]
  .map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');

test('public manifest keeps nativeMessaging optional and the pinned ID', () => {
  assert.ok(base.optional_permissions.includes('nativeMessaging'));
  assert.ok(!base.permissions.includes('nativeMessaging'));
  assert.equal(chromeID(base), 'haoofoeepleghoifialnncpknmjbjamd');
});

test('LM Bar bundled manifest requires the bridge, keeps key, LM host access and other optionals', () => {
  const b = bundledManifest(base);
  assert.ok(b.permissions.includes('nativeMessaging'));
  assert.ok(!b.optional_permissions.includes('nativeMessaging'));
  assert.deepEqual(b.optional_permissions, ['notifications', 'history']);
  assert.equal(b.key, base.key);
  assert.equal(chromeID(b), 'haoofoeepleghoifialnncpknmjbjamd');
  assert.deepEqual(b.host_permissions, ['https://core.xjtlu.edu.cn/*']);
  assert.deepEqual(bundledManifest(b), b, 'idempotent');
  const f = firefoxManifest(b);
  assert.ok(f.permissions.includes('nativeMessaging') && !f.optional_permissions.includes('nativeMessaging'));
  assert.equal(f.key, undefined);
});
