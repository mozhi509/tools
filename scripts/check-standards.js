#!/usr/bin/env node
/**
 * 代码规范检查：依据 docs/client 与 docs/server 规范，在 build 前执行。
 * 不通过则退出码 1，禁止继续编译。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVER_DIR = path.join(ROOT, 'server');
const CLIENT_SRC = path.join(ROOT, 'client', 'src');

const errors = [];

function readFiles(dir, ext, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && e.name !== 'dist') {
      out.push(...readFiles(full, ext, base));
    } else if (e.isFile() && ext.some((x) => e.name.endsWith(x))) {
      const rel = path.relative(base, full);
      out.push({ full, relative: rel.replace(/\\/g, '/'), content: fs.readFileSync(full, 'utf8') });
    }
  }
  return out;
}

// ---------- Server 规范 ----------
const serverFiles = readFiles(SERVER_DIR, ['.ts']);
for (const { relative, content } of serverFiles) {
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    if (/\bcatch\s*\(\s*\w+\s*:\s*any\s*\)/.test(line)) {
      errors.push(`[server] server/${relative}:${lineNum} 禁止使用 catch (error: any)，应使用 catch (error: unknown)`);
    }
  });
}

// ---------- Client 规范 ----------
const clientFiles = readFiles(CLIENT_SRC, ['.ts', '.tsx']);
const apiBasePattern = /['"`]https?:\/\/[^'`"]*\/api\b|['"`]\/api\b|localhost\s*:\s*3001/g;
for (const { relative, content } of clientFiles) {
  if (relative.includes('config/api.ts')) continue;
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    if (/\bcatch\s*\(\s*\w+\s*:\s*any\s*\)/.test(line)) {
      errors.push(`[client] client/src/${relative}:${lineNum} 禁止使用 catch (error: any)，应使用 catch (error: unknown)`);
    }
    if (apiBasePattern.test(line) && !line.trim().startsWith('//')) {
      errors.push(`[client] client/src/${relative}:${lineNum} 禁止硬编码 API 地址，请使用 config/api.ts 的 API_ENDPOINTS`);
    }
  });
}

// ---------- 输出结果 ----------
if (errors.length > 0) {
  console.error('\n代码规范检查未通过（build 已阻止）：\n');
  errors.forEach((e) => console.error('  ' + e));
  console.error('\n请依据 docs/client/代码规范.md 与 docs/server/代码规范.md 修改后重试。\n');
  process.exit(1);
}

console.log('代码规范检查通过，允许编译。');
process.exit(0);
