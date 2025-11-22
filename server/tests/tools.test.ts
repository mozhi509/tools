import request from 'supertest';
import express from 'express';
import toolsRouter from '../routes/tools';

const app = express();
app.use(express.json());
app.use('/api/tools', toolsRouter);

describe('Tools API', () => {
  describe('JSON Tools', () => {
    test('POST /api/tools/json/format - should format valid JSON', async () => {
      const response = await request(app)
        .post('/api/tools/json/format')
        .send({
          json: '{"name":"test","value":123}',
          indent: 2
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('formatted');
      expect(response.body).toHaveProperty('original');
      expect(response.body.formatted).toContain('  ');
    });

    test('POST /api/tools/json/format - should handle missing json parameter', async () => {
      const response = await request(app)
        .post('/api/tools/json/format')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', '请提供要格式化的JSON字符串');
    });

    test('POST /api/tools/json/format - should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/tools/json/format')
        .send({
          json: 'invalid json',
          indent: 2
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'JSON格式错误');
    });

    test('POST /api/tools/json/validate - should validate valid JSON', async () => {
      const response = await request(app)
        .post('/api/tools/json/validate')
        .send({
          json: '{"valid": true}'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('message', 'JSON格式正确');
    });

    test('POST /api/tools/json/validate - should validate invalid JSON', async () => {
      const response = await request(app)
        .post('/api/tools/json/validate')
        .send({
          json: 'invalid json'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/tools/json/minify - should minify valid JSON', async () => {
      const response = await request(app)
        .post('/api/tools/json/minify')
        .send({
          json: '{\n  "name": "test",\n  "value": 123\n}'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('minified');
      expect(response.body).toHaveProperty('original');
      expect(response.body.minified).not.toContain('\n');
      expect(response.body.minified).not.toContain('  ');
    });

    test('POST /api/tools/json/minify - should handle missing json parameter', async () => {
      const response = await request(app)
        .post('/api/tools/json/minify')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', '请提供要压缩的JSON字符串');
    });
  });

  describe('Base64 Tools', () => {
    test('POST /api/tools/base64/encode - should encode text to base64', async () => {
      const response = await request(app)
        .post('/api/tools/base64/encode')
        .send({
          text: 'Hello World!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('encoded');
      expect(response.body).toHaveProperty('original');
      expect(response.body.encoded).toBe('SGVsbG8gV29ybGQh');
    });

    test('POST /api/tools/base64/decode - should decode base64 to text', async () => {
      const response = await request(app)
        .post('/api/tools/base64/decode')
        .send({
          encoded: 'SGVsbG8gV29ybGQh'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('decoded');
      expect(response.body).toHaveProperty('original');
      expect(response.body.decoded).toBe('Hello World!');
    });

    test('POST /api/tools/base64/decode - should handle invalid base64', async () => {
      const response = await request(app)
        .post('/api/tools/base64/decode')
        .send({
          encoded: 'invalid base64!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Base64格式错误或解码失败');
    });
  });

  describe('URL Tools', () => {
    test('POST /api/tools/url/encode - should encode URL', async () => {
      const response = await request(app)
        .post('/api/tools/url/encode')
        .send({
          url: 'https://example.com/search?q=test&type=advanced'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('encoded');
      expect(response.body).toHaveProperty('original');
      expect(response.body.encoded).toContain('%');
    });

    test('POST /api/tools/url/decode - should decode URL', async () => {
      const response = await request(app)
        .post('/api/tools/url/decode')
        .send({
          url: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dtest%26type%3Dadvanced'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('decoded');
      expect(response.body).toHaveProperty('original');
      expect(response.body.decoded).toBe('https://example.com/search?q=test&type=advanced');
    });

    test('POST /api/tools/url/decode - should handle invalid URL encoding', async () => {
      const response = await request(app)
        .post('/api/tools/url/decode')
        .send({
          url: 'https://example.com/%invalid'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'URL格式错误或解码失败');
    });
  });
});