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

  describe('Deactivation revokes access immediately, not just at next login', () => {
    it('should reject a still-cryptographically-valid token once the user is deactivated', async () => {
      // 1. Admin creates a disposable test user (never touching Bob/Alice/Charlie,
      //    since other test files depend on those accounts staying active)
      const uniqueEmail = `deactivate_test_${Date.now()}@tracker.com`;
      const createRes = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Soon To Be Deactivated',
          email: uniqueEmail,
          password: 'SecureP@ss123',
          roleId: 3
        });
      expect(createRes.statusCode).toBe(201);
      const newUserId = createRes.body.data.id;

      // 2. That user logs in and gets a valid, unexpired JWT
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: uniqueEmail, password: 'SecureP@ss123' });
      expect(loginRes.statusCode).toBe(200);
      const staleToken = loginRes.body.token;

      // 3. Confirm the fresh token genuinely works before deactivation
      const beforeRes = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${staleToken}`);
      expect(beforeRes.statusCode).toBe(200);

      // 4. Admin deactivates the user
      const deactivateRes = await request(app)
        .delete(`/api/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deactivateRes.statusCode).toBe(200);

      // 5. The SAME, still-unexpired token must now be rejected —
      // proving revocation is enforced on every request, not just at login
      const afterRes = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${staleToken}`);
      expect(afterRes.statusCode).toBe(403);
      expect(afterRes.body.success).toBe(false);
      expect(afterRes.body.message).toContain('deactivated');
    });
  });

  describe('Deactivated users are excluded from dropdowns but not from Admin\'s user list', () => {
    it('should exclude a deactivated user from ?activeOnly=true but keep them in the default list', async () => {
      const uniqueEmail = `filter_test_${Date.now()}@tracker.com`;
      const createRes = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Filter Test User',
          email: uniqueEmail,
          password: 'SecureP@ss123',
          roleId: 3
        });
      expect(createRes.statusCode).toBe(201);
      const newUserId = createRes.body.data.id;

      await request(app)
        .delete(`/api/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const activeOnlyRes = await request(app)
        .get('/api/users?activeOnly=true')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(activeOnlyRes.statusCode).toBe(200);
      expect(activeOnlyRes.body.data.some((u) => u.id === newUserId)).toBe(false);

      const defaultRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(defaultRes.statusCode).toBe(200);
      const foundUser = defaultRes.body.data.find((u) => u.id === newUserId);
      expect(foundUser).toBeDefined();
      expect(foundUser.is_active).toBe(0);
    });
  });
});