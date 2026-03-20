import request from 'supertest';
import express from 'express';

const connectRedis = jest.fn().mockResolvedValue(undefined);
const setEx = jest.fn().mockResolvedValue('OK');
const expire = jest.fn().mockResolvedValue(1);
const exists = jest.fn().mockResolvedValue(1);
const lRange = jest.fn().mockResolvedValue([]);
const rPush = jest.fn().mockResolvedValue(1);
const lTrim = jest.fn().mockResolvedValue('OK');

jest.mock('../redis', () => ({
  connectRedis,
  redisClient: {
    setEx,
    expire,
    exists,
    lRange,
    rPush,
    lTrim,
  },
}));

import chatRouter from '../routes/chat';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/chat', chatRouter);
  return app;
}

describe('POST /api/chat/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates chat session', async () => {
    const app = createApp();
    const res = await request(app).post('/api/chat/create').send({}).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.chatId).toBeDefined();
    expect(res.body.chatPath).toMatch(/^\/chat\//);
    expect(connectRedis).toHaveBeenCalled();
    expect(setEx).toHaveBeenCalled();
    expect(expire).toHaveBeenCalled();
  });
});

describe('POST /api/chat/:chatId/join', () => {
  it('returns clientId when session exists', async () => {
    exists.mockResolvedValueOnce(1);
    const app = createApp();
    const res = await request(app).post('/api/chat/abc12345/join').send({}).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.chatId).toBe('abc12345');
    expect(res.body.clientId).toMatch(/^client-/);
  });

  it('404 when session missing', async () => {
    exists.mockResolvedValueOnce(0);
    const app = createApp();
    const res = await request(app).post('/api/chat/missingid/join').send({}).expect(404);

    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/chat/:chatId/messages', () => {
  it('returns message list', async () => {
    exists.mockResolvedValueOnce(1);
    lRange.mockResolvedValueOnce([]);
    const app = createApp();
    const res = await request(app).get('/api/chat/abc12345/messages').expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.messages)).toBe(true);
  });
});

describe('POST /api/chat/:chatId/messages', () => {
  it('rejects empty text', async () => {
    exists.mockResolvedValueOnce(1);
    const app = createApp();
    const res = await request(app).post('/api/chat/abc12345/messages').send({ text: '   ' }).expect(400);

    expect(res.body.error).toBeDefined();
  });

  it('stores message', async () => {
    exists.mockResolvedValueOnce(1);
    const app = createApp();
    const res = await request(app)
      .post('/api/chat/abc12345/messages')
      .send({ text: 'hi', clientId: 'client-test' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message.text).toBe('hi');
    expect(rPush).toHaveBeenCalled();
  });
});
