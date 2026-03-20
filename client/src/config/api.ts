export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  json: {
    format: `${API_BASE_URL}/tools/json/format`,
    validate: `${API_BASE_URL}/tools/json/validate`,
    minify: `${API_BASE_URL}/tools/json/minify`,
  },
  base64: {
    encode: `${API_BASE_URL}/tools/base64/encode`,
    decode: `${API_BASE_URL}/tools/base64/decode`,
  },
  url: {
    encode: `${API_BASE_URL}/tools/url/encode`,
    decode: `${API_BASE_URL}/tools/url/decode`,
  },
  share: {
    create: `${API_BASE_URL}/share/create`,
    get: (shareId: string) => `${API_BASE_URL}/share/${encodeURIComponent(shareId)}`,
  },
  video: {
    upload: `${API_BASE_URL}/video/upload`,
    trim: `${API_BASE_URL}/video/trim`,
    merge: `${API_BASE_URL}/video/merge`,
    filter: `${API_BASE_URL}/video/filter`,
    download: (filename: string) =>
      `${API_BASE_URL}/video/download/${encodeURIComponent(filename)}`,
    info: (filename: string) =>
      `${API_BASE_URL}/video/info/${encodeURIComponent(filename)}`,
    cleanup: (filename: string) =>
      `${API_BASE_URL}/video/cleanup/${encodeURIComponent(filename)}`,
  },
  chat: {
    create: `${API_BASE_URL}/chat/create`,
    join: (chatId: string) => `${API_BASE_URL}/chat/${chatId}/join`,
    messages: (chatId: string) => `${API_BASE_URL}/chat/${chatId}/messages`,
  },
};

/**
 * 将后端返回的相对路径（如 /api/video/download/xxx）转为当前页面可访问的绝对 URL。
 * 开发环境通过同源 + Dev Server 代理访问后端；生产环境与站点同源。
 */
export function resolveApiAssetUrl(apiPath: string): string {
  if (!apiPath) return '';
  if (/^https?:\/\//i.test(apiPath)) return apiPath;
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  return `${window.location.origin}${path}`;
}
