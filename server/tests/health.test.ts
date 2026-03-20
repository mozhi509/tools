import request from 'supertest';
import express, { Request, Response } from 'express';

/**
 * 健康检查路由与 index 中行为一致（避免启动整站与 Redis）
 */
function createHealthApp() {
  const app = express();
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  return app;
}

describe('GET /api/health', () => {
  it('returns OK and timestamp', async () => {
    const app = createHealthApp();
    const res = await request(app).get('/api/health').expect(200);

    expect(res.body.status).toBe('OK');
    expect(typeof res.body.timestamp).toBe('string');
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
  });
});
