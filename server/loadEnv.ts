/**
 * 必须在其它 server 模块之前加载，确保 process.env 含根目录 .env。
 *
 * 本地开发：只读 `.env`（例如 REDIS_PASSWORD=123456），**不会**再被 `.env.prod` 覆盖。
 * 生产：在 NODE_ENV=production 时再加载 `.env.prod`（override），与 PM2 / Docker 一致。
 */
import path from 'path';
import dotenv from 'dotenv';

const root = path.resolve(__dirname, '..');

type DotenvResult = { parsed?: Record<string, string>; error?: Error };

function logLoad(filePath: string, result: DotenvResult) {
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
const envResult = dotenv.config({ path: envPath });
logLoad(envPath, envResult);

const nodeEnv = process.env.NODE_ENV ?? '(unset)';
if (process.env.NODE_ENV === 'production') {
  const prodPath = path.join(root, '.env.prod');
  // dotenv@16 支持 override；若本地 @types 偏旧可忽略类型告警
  const prodResult = dotenv.config({
    path: prodPath,
    override: true,
  } as Parameters<typeof dotenv.config>[0]);
  logLoad(prodPath, prodResult);
  console.log(`[loadEnv] NODE_ENV=production，已尝试用 .env.prod 覆盖同名变量`);
} else {
  console.log(`[loadEnv] NODE_ENV=${nodeEnv}，不加载 .env.prod`);
}
