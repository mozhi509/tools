import request from 'supertest';
import express from 'express';

const connectRedis = jest.fn().mockResolvedValue(undefined);
const setEx = jest.fn().mockResolvedValue('OK');
const get = jest.fn();

jest.mock('../redis', () => ({
  connectRedis,
  redisClient: {
    setEx,
    get,
  },
}));

import shareRouter from '../routes/share';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/share', shareRouter);
  return app;
}

describe('POST /api/share/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires data', async () => {
    const app = createApp();
    const res = await request(app).post('/api/share/create').send({}).expect(400);

    expect(res.body.error).toBeDefined();
  });

  it('creates share id', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/share/create')
      .send({ data: { foo: 1 } })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.shareId).toBeDefined();
    expect(res.body.shareUrl).toContain('/share/');
    expect(setEx).toHaveBeenCalled();
  });
});

describe('GET /api/share/:shareId', () => {
  it('404 when not found', async () => {
    get.mockResolvedValueOnce(null);
    const app = createApp();
    const res = await request(app).get('/api/share/nosuch').expect(404);

    expect(res.body.error).toBeDefined();
  });

  it('returns stored payload', async () => {
    const payload = {
      data: { x: 1 },
      createdAt: new Date().toISOString(),
      type: 'json-formatter',
    };
    get.mockResolvedValueOnce(JSON.stringify(payload));
    const app = createApp();
    const res = await request(app).get('/api/share/abcd1234').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ x: 1 });
    expect(res.body.type).toBe('json-formatter');
  });
});
