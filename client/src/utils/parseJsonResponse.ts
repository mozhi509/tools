/**
 * 解析 fetch 的 Response 为 JSON。若服务端误返回 HTML（常见于 Nginx 把 /api 指到 index.html），给出明确错误。
 */
export async function parseJsonResponse<T = unknown>(response: Response): Promise<T> {
  const text = await response.text();
  const trimmed = text.trimStart();
  if (trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
    throw new Error(
      '接口返回了网页(HTML)而不是 JSON。部署时请让 Nginx/CDN 将 /api 反代到 Node 进程，且勿对 /api 使用 SPA 的 try_files 回退到 index.html。详见项目 docs/nginx部署示例.conf'
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `接口响应不是合法 JSON（HTTP ${response.status}）。请检查后端与反代配置。`
    );
  }
}
