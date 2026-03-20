import { API_BASE_URL, API_ENDPOINTS, resolveApiAssetUrl } from './api';

/** 与 config 中 API 地址一致的路径（避免测试中字面量写 /api 触发规范检查） */
function pathnameFromConfiguredUrl(url: string): string {
  return url.startsWith('http') ? new URL(url).pathname : url;
}

describe('API_ENDPOINTS', () => {
  it('json endpoints include tools path', () => {
    expect(API_ENDPOINTS.json.format).toMatch(/\/tools\/json\/format$/);
    expect(API_ENDPOINTS.json.validate).toMatch(/\/tools\/json\/validate$/);
  });

  it('share.get encodes shareId', () => {
    const url = API_ENDPOINTS.share.get('a/b');
    expect(url).toContain(encodeURIComponent('a/b'));
  });

  it('chat messages path includes chatId', () => {
    expect(API_ENDPOINTS.chat.messages('xyz')).toMatch(/\/chat\/xyz\/messages$/);
  });
});

describe('resolveApiAssetUrl', () => {
  it('returns empty for empty input', () => {
    expect(resolveApiAssetUrl('')).toBe('');
  });

  it('returns absolute URL unchanged', () => {
    expect(resolveApiAssetUrl('https://example.com/x')).toBe('https://example.com/x');
    expect(resolveApiAssetUrl('http://a.com/y')).toBe('http://a.com/y');
  });

  it('prefixes window.location.origin for relative api path', () => {
    const origin = window.location.origin;
    const downloadPath = pathnameFromConfiguredUrl(API_ENDPOINTS.video.download('foo.mp4'));
    expect(resolveApiAssetUrl(downloadPath)).toBe(`${origin}${downloadPath}`);
  });

  it('adds leading slash when missing', () => {
    const origin = window.location.origin;
    const apiRoot = pathnameFromConfiguredUrl(API_BASE_URL);
    const withoutLeadingSlash = apiRoot.replace(/^\//, '');
    const relative = `${withoutLeadingSlash}/x`;
    expect(resolveApiAssetUrl(relative)).toBe(`${origin}${apiRoot}/x`);
  });
});
