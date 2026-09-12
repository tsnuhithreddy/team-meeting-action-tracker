const request = require('supertest');
const app = require('../src/app');

describe('Meeting Management API', () => {
  let managerToken;
  let employeeToken;

  beforeAll(async () => {
    // 1. Log in as Manager (Alice)
    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@tracker.com', password: 'password123' });
    managerToken = managerRes.body.token;

    // 2. Log in as Employee (Bob)
    const employeeRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@tracker.com', password: 'password123' });
    employeeToken = employeeRes.body.token;
  });

  it('GET /api/meetings - should fetch meetings list for authenticated user', async () => {
    const res = await request(app)
      .get('/api/meetings')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/meetings - should reject meeting creation when end_time is before start_time', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Invalid Time Meeting',
        meetingDate: '2026-10-15',
        startTime: '14:00:00',
        endTime: '13:00:00' // End before start
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Meeting end time must be after the start time');
  });

  it('POST /api/meetings - should allow Manager to create a valid meeting with participants', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Sprint 2 Kickoff',
        description: 'Review backlog items and assign initial tasks.',
        meetingDate: '2026-10-20',
        startTime: '09:00:00',
        endTime: '10:30:00',
        locationOrLink: 'Zoom Room 101',
        participantIds: [3, 4]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Sprint 2 Kickoff');
    expect(res.body.data.participants.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/meetings - should forbid Employee from creating a meeting (RBAC)', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        title: 'Unauthorized Meeting',
        meetingDate: '2026-10-22',
        startTime: '10:00:00',
        endTime: '11:00:00'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  it('POST /api/meetings - should reject a participantIds array containing non-integer or invalid values', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Bad participant IDs',
        meetingDate: '2026-10-25',
        startTime: '10:00:00',
        endTime: '11:00:00',
        participantIds: ['hello', -20]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});