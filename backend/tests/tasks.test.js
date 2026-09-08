const request = require('supertest');
const app = require('../src/app');

describe('Task Management & Business Rules API', () => {
  let managerToken;
  let employeeBobToken;
  let employeeCharlieToken;
  let createdTaskId;

  beforeAll(async () => {
    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@tracker.com', password: 'password123' });
    managerToken = managerRes.body.token;

    const bobRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@tracker.com', password: 'password123' });
    employeeBobToken = bobRes.body.token;

    const charlieRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'charlie@tracker.com', password: 'password123' });
    employeeCharlieToken = charlieRes.body.token;
  });

  it('POST /api/tasks - should allow Manager to create and assign a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        meetingId: 1,
        title: 'Write Unit Tests for Task Service',
        description: 'Ensure 100% test coverage for state machine rules.',
        assigneeId: 3,
        priority: 'HIGH',
        dueDate: '2026-11-01'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Write Unit Tests for Task Service');
    expect(res.body.data.status).toBe('OPEN');
    createdTaskId = res.body.data.id;
  });

  it('POST /api/tasks - should forbid Employee from creating tasks (RBAC)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${employeeBobToken}`)
      .send({
        meetingId: 1,
        title: 'Unauthorized Task Creation',
        dueDate: '2026-11-01'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/tasks/:id/status - should allow assigned Employee (Bob) to update status to IN_PROGRESS', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${employeeBobToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('PATCH /api/tasks/:id/status - should forbid unassigned Employee (Charlie) from updating Bob’s task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${employeeCharlieToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('You can only update the status of tasks assigned to you');
  });

  
  describe('PUT /api/tasks/:id - full update validation', () => {
    it('should allow Manager to fully update a task with a valid payload', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          title: 'Write Unit Tests for Task Service (revised)',
          description: 'Updated scope after review.',
          assigneeId: 3,
          priority: 'CRITICAL',
          status: 'IN_PROGRESS',
          dueDate: '2026-11-15'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Write Unit Tests for Task Service (revised)');
      expect(res.body.data.priority).toBe('CRITICAL');
    });

    it('should reject a full update missing the required priority field with 400, not a raw DB error', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          title: 'Missing priority field',
          status: 'OPEN',
          dueDate: '2026-11-15'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject a full update with an invalid priority value', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          title: 'Invalid priority value',
          priority: 'SUPER_URGENT',
          status: 'OPEN',
          dueDate: '2026-11-15'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject a full update missing the required title field', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          priority: 'LOW',
          status: 'OPEN',
          dueDate: '2026-11-15'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should still forbid Employee from calling PUT at all (RBAC unchanged)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${employeeBobToken}`)
        .send({
          title: 'Employee should not reach this',
          priority: 'LOW',
          status: 'OPEN',
          dueDate: '2026-11-15'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  it('GET /api/tasks/my-tasks - should return only tasks assigned to Bob', async () => {
    const res = await request(app)
      .get('/api/tasks/my-tasks')
      .set('Authorization', `Bearer ${employeeBobToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((t) => t.id === createdTaskId)).toBe(true);
  });

  describe('Access control on tasks outside a user\'s meetings', () => {
    it('GET /api/tasks/4 - should forbid Charlie from viewing a task in a meeting he is not part of', async () => {
      const res = await request(app)
        .get('/api/tasks/4')
        .set('Authorization', `Bearer ${employeeCharlieToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/tasks - should NOT include task 4 in Charlie\'s task list', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${employeeCharlieToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.some((t) => t.id === 4)).toBe(false);
    });

    it('GET /api/tasks/4 - should allow Bob to view it (he is the assignee)', async () => {
      const res = await request(app)
        .get('/api/tasks/4')
        .set('Authorization', `Bearer ${employeeBobToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(4);
    });

    it('GET /api/tasks/4 - should allow Manager Alice to view it regardless of assignment', async () => {
      const res = await request(app)
        .get('/api/tasks/4')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(4);
    });
  });
});