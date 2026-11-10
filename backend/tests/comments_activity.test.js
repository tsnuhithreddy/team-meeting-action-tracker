const request = require('supertest');
const app = require('../src/app');

describe('Task Comments & Activity Logs API', () => {
  let employeeArjunToken;
  let managerRahulToken;
  let employeeRohitToken;

  beforeAll(async () => {
    const arjunRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'arjun@tracker.com', password: 'password123' });
    employeeArjunToken = arjunRes.body.token;

    const rahulRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul@tracker.com', password: 'password123' });
    managerRahulToken = rahulRes.body.token;

    const rohitRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rohit@tracker.com', password: 'password123' });
    employeeRohitToken = rohitRes.body.token;
  });

  it('POST /api/tasks/:id/comments - should allow employee to post a comment on a task', async () => {
    const res = await request(app)
      .post('/api/tasks/1/comments')
      .set('Authorization', `Bearer ${employeeArjunToken}`)
      .send({ commentText: 'Finished writing the SQL indexes and constraints.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comment_text).toBe('Finished writing the SQL indexes and constraints.');
    expect(res.body.data.author_name).toBe('Developer Arjun');
  });

  it('POST /api/tasks/:id/comments - should reject empty comment text', async () => {
    const res = await request(app)
      .post('/api/tasks/1/comments')
      .set('Authorization', `Bearer ${employeeArjunToken}`)
      .send({ commentText: '   ' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/tasks/:id/comments - should fetch chronological comments list for a task', async () => {
    const res = await request(app)
      .get('/api/tasks/1/comments')
      .set('Authorization', `Bearer ${employeeArjunToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/tasks/:id/comments - should forbid Rohit from viewing comments on a task outside his meetings', async () => {
    const res = await request(app)
      .get('/api/tasks/4/comments')
      .set('Authorization', `Bearer ${employeeRohitToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/tasks/:id/comments - should forbid Rohit from commenting on a task outside his meetings', async () => {
    const res = await request(app)
      .post('/api/tasks/4/comments')
      .set('Authorization', `Bearer ${employeeRohitToken}`)
      .send({ commentText: 'Trying to comment on a task I should not have access to.' });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/activity - should fetch system activity log for Manager', async () => {
    const res = await request(app)
      .get('/api/activity')
      .set('Authorization', `Bearer ${managerRahulToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});