const request = require('supertest');
const app = require('../src/app');

describe('System Health Check API', () => {
  it('GET /api/health should return status 200 and operational status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('operational');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/non-existent-route should return status 404 with AppError format', async () => {
    const res = await request(app).get('/api/non-existent-route');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Cannot find endpoint');
  });
});
