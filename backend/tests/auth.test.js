const request = require('supertest');
const app = require('../src/app');

describe('Authentication & Authorization API', () => {
  it('POST /api/auth/login - should log in successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@tracker.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('admin@tracker.com');
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('POST /api/auth/login - should fail with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@tracker.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('GET /api/auth/me - should reject access without JWT token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('You are not logged in');
  });

  it('GET /api/auth/me - should return user profile with valid JWT token', async () => {
    // 1. Log in first
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@tracker.com',
        password: 'password123'
      });

    const token = loginRes.body.token;

    // 2. Call /me with Bearer token
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.email).toBe('alice@tracker.com');
    expect(meRes.body.user.role).toBe('MANAGER');
  });
});