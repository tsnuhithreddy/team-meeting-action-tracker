const request = require('supertest');
const app = require('../src/app');

describe('Task Comments & Activity Logs API', () => {
  let employeeBobToken;
  let managerAliceToken;

  beforeAll(async () => {
    const bobRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@tracker.com', password: 'password123' });
    employeeBobToken = bobRes.body.token;

    const aliceRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@tracker.com', password: 'password123' });
    managerAliceToken = aliceRes.body.token;
  });

  it('POST /api/tasks/:id/comments - should allow employee to post a comment on a task', async () => {
    const res = await request(app)
      .post('/api/tasks/1/comments')
      .set('Authorization', `Bearer ${employeeBobToken}`)
      .send({ commentText: 'Finished writing the SQL indexes and constraints.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comment_text).toBe('Finished writing the SQL indexes and constraints.');
    expect(res.body.data.author_name).toBe('Developer Bob');
  });

  it('POST /api/tasks/:id/comments - should reject empty comment text', async () => {
    const res = await request(app)
      .post('/api/tasks/1/comments')
      .set('Authorization', `Bearer ${employeeBobToken}`)
      .send({ commentText: '   ' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/tasks/:id/comments - should fetch chronological comments list for a task', async () => {
    const res = await request(app)
      .get('/api/tasks/1/comments')
      .set('Authorization', `Bearer ${employeeBobToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/activity - should fetch system activity log for Manager', async () => {
    const res = await request(app)
      .get('/api/activity')
      .set('Authorization', `Bearer ${managerAliceToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});