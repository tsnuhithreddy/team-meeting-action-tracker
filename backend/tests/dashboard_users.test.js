const request = require('supertest');
const app = require('../src/app');

describe('Dashboard & User Management API', () => {
  let adminToken;
  let managerToken;
  let employeeToken;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@tracker.com', password: 'password123' });
    adminToken = adminRes.body.token;

    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@tracker.com', password: 'password123' });
    managerToken = managerRes.body.token;

    const employeeRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@tracker.com', password: 'password123' });
    employeeToken = employeeRes.body.token;
  });

  it('GET /api/dashboard - should return metrics summary for Manager', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('metrics');
    expect(res.body.data.metrics).toHaveProperty('totalMeetings');
    expect(res.body.data.metrics).toHaveProperty('totalTasks');
    expect(res.body.data.metrics).toHaveProperty('overdueTasks');
    expect(Array.isArray(res.body.data.recentActivity)).toBe(true);
  });

  it('GET /api/users - should allow Admin to list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/users - should forbid Employee from listing all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/users - should allow Admin to create a new user account', async () => {
    const uniqueEmail = `testuser_${Date.now()}@tracker.com`;
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'New Test Engineer',
        email: uniqueEmail,
        password: 'SecureP@ss123',
        roleId: 3 // EMPLOYEE
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(uniqueEmail);
  });

  it('POST /api/users - should reject a password with no uppercase, number, or special character', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Weak Password User',
        email: `weakpass_${Date.now()}@tracker.com`,
        password: 'password123',
        roleId: 3
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/users - should reject a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Short Password User',
        email: `shortpass_${Date.now()}@tracker.com`,
        password: 'Ab1!',
        roleId: 3
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});