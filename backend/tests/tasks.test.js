const request = require('supertest');
const app = require('../src/app');

describe('Task Management & Business Rules API', () => {
  let managerToken;
  let employeeBobToken;
  let employeeCharlieToken;
  let createdTaskId;

  beforeAll(async () => {
    // Log in Manager Alice
    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@tracker.com', password: 'password123' });
    managerToken = managerRes.body.token;

    // Log in Employee Bob (id: 3)
    const bobRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@tracker.com', password: 'password123' });
    employeeBobToken = bobRes.body.token;

    // Log in Employee Charlie (id: 4)
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
        assigneeId: 3, // Assigned to Bob
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

  it('GET /api/tasks/my-tasks - should return only tasks assigned to Bob', async () => {
    const res = await request(app)
      .get('/api/tasks/my-tasks')
      .set('Authorization', `Bearer ${employeeBobToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((t) => t.id === createdTaskId)).toBe(true);
  });
});