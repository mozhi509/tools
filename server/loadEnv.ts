/**
 * 必须在其它 server 模块之前加载，确保 process.env 含根目录 .env。
 * 不依赖 npm 包 dotenv，避免生产 `node dist/index.js` 时缺模块。
 *
 * 本地开发：只读 `.env`，**不会**再被 `.env.prod` 覆盖。
 * 生产：在 NODE_ENV=production 时再加载 `.env.prod`（override）。
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');

/** 解析 .env 文本（# 注释、export KEY=、引号包裹） */
function parseEnvContent(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  const text = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
  for (let line of text.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

type LoadResult = { parsed?: Record<string, string>; error?: NodeJS.ErrnoException | Error };

function loadEnvFromFile(filePath: string, override: boolean): LoadResult {
  try {
    if (!fs.existsSync(filePath)) {
      const e = new Error('ENOENT') as NodeJS.ErrnoException;
      e.code = 'ENOENT';
      return { error: e };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = parseEnvContent(raw);
    for (const [k, v] of Object.entries(parsed)) {
      if (override || !(k in process.env)) {
        process.env[k] = v;
      }
    }
    return { parsed };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

function logLoad(filePath: string, result: LoadResult) {
  const rel = path.relative(root, filePath) || filePath;
  if (result.error) {
    const code = (result.error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      console.log(`[loadEnv] 跳过（无此文件）: ${rel}`);
    } else {
      console.warn(`[loadEnv] 读取失败: ${rel}`, result.error.message);
    }
    return;
  }
  const n = result.parsed ? Object.keys(result.parsed).length : 0;
  console.log(`[loadEnv] 已加载: ${rel}（${n} 个键）`);
}

const envPath = path.join(root, '.env');
const envResult = loadEnvFromFile(envPath, false);
logLoad(envPath, envResult);

const nodeEnv = process.env.NODE_ENV ?? '(unset)';
if (process.env.NODE_ENV === 'production') {
  const prodPath = path.join(root, '.env.prod');
  const prodResult = loadEnvFromFile(prodPath, true);
  logLoad(prodPath, prodResult);
  console.log(`[loadEnv] NODE_ENV=production，已尝试用 .env.prod 覆盖同名变量`);
} else {
  console.log(`[loadEnv] NODE_ENV=${nodeEnv}，不加载 .env.prod`);
}
