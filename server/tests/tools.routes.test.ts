import request from 'supertest';
import express from 'express';
import toolsRouter from '../routes/tools';

function createApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api/tools', toolsRouter);
  return app;
}

describe('POST /api/tools/json/format', () => {
  const app = createApp();

  it('formats valid JSON', async () => {
    const res = await request(app)
      .post('/api/tools/json/format')
      .send({ json: '{"a":1}', indent: 2 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.formatted).toContain('"a"');
    expect(res.body.formatted).toContain('1');
  });

  it('returns 400 when json missing', async () => {
    const res = await request(app).post('/api/tools/json/format').send({}).expect(400);

    expect(res.body.success).toBe(false);
  });

  it('returns 400 on invalid JSON', async () => {
    const res = await request(app)
      .post('/api/tools/json/format')
      .send({ json: 'not json' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/tools/json/validate', () => {
  const app = createApp();

  it('validates correct JSON', async () => {
    const res = await request(app)
      .post('/api/tools/json/validate')
      .send({ json: '{}' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.valid).toBe(true);
  });

  it('returns valid:false for bad JSON', async () => {
    const res = await request(app)
      .post('/api/tools/json/validate')
      .send({ json: '{' })
      .expect(200);

    expect(res.body.valid).toBe(false);
  });
});

describe('POST /api/tools/json/minify', () => {
  const app = createApp();

  it('minifies JSON', async () => {
    const res = await request(app)
      .post('/api/tools/json/minify')
      .send({ json: '{\n  "x": 1\n}' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.minified).toBe('{"x":1}');
  });
});

describe('POST /api/tools/base64/*', () => {
  const app = createApp();

  it('encodes text to base64', async () => {
    const res = await request(app)
      .post('/api/tools/base64/encode')
      .send({ text: 'hello' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.encoded).toBe(Buffer.from('hello', 'utf8').toString('base64'));
  });

  it('decodes base64', async () => {
    const encoded = Buffer.from('hello', 'utf8').toString('base64');
    const res = await request(app)
      .post('/api/tools/base64/decode')
      .send({ encoded })
      .expect(200);

    expect(res.body.decoded).toBe('hello');
  });
});

describe('POST /api/tools/url/*', () => {
  const app = createApp();

  it('encodes URL component', async () => {
    const res = await request(app)
      .post('/api/tools/url/encode')
      .send({ url: 'a b' })
      .expect(200);

    expect(res.body.encoded).toBe(encodeURIComponent('a b'));
  });

  it('decodes URL component', async () => {
    const res = await request(app)
      .post('/api/tools/url/decode')
      .send({ url: encodeURIComponent('a b') })
      .expect(200);

    expect(res.body.decoded).toBe('a b');
  });
});
