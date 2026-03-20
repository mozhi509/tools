import { API_ENDPOINTS, resolveApiAssetUrl } from './api';

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
    expect(resolveApiAssetUrl('/api/video/download/foo.mp4')).toBe(`${origin}/api/video/download/foo.mp4`);
  });

  it('adds leading slash when missing', () => {
    const origin = window.location.origin;
    expect(resolveApiAssetUrl('api/x')).toBe(`${origin}/api/x`);
  });
});
