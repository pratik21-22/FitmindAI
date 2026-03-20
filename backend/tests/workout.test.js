const request = require('supertest');
const app = require('../server');
const { connect, clearDatabase, close } = require('./helpers/testDb');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await close(); });

const signupAndLogin = async () => {
  const res = await request(app).post('/api/auth/signup').send({
    name: 'Workout Tester',
    email: 'workout@fitmind.test',
    password: 'password123',
    weight: 80,
    height: 180,
    goal: 'build_muscle',
  });
  return res.body.token;
};

const WORKOUT = {
  name: 'Morning Bench Press',
  type: 'strength',
  duration: 45,
  caloriesBurned: 300,
  sets: 4,
  reps: 10,
  intensity: 'high',
};

// ───────────────────────────────────────────────────
// Create
// ───────────────────────────────────────────────────
describe('POST /api/workouts', () => {
  it('creates a workout and returns 25 XP', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send(WORKOUT);
    expect(res.statusCode).toBe(201);
    expect(res.body.workout.name).toBe(WORKOUT.name);
    expect(res.body.xp).toBe(25);
  });

  it('returns 400 when required fields are missing', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'cardio' }); // missing name and duration
    expect(res.statusCode).toBe(400);
  });

  it('does not store arbitrary injected fields', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...WORKOUT, __v: 999, malicious: 'inject' });
    expect(res.statusCode).toBe(201);
    expect(res.body.workout.malicious).toBeUndefined();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/workouts').send(WORKOUT);
    expect(res.statusCode).toBe(401);
  });
});

// ───────────────────────────────────────────────────
// List / Stats
// ───────────────────────────────────────────────────
describe('GET /api/workouts', () => {
  it('returns an empty list for a new user', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .get('/api/workouts')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.workouts).toHaveLength(0);
  });

  it('returns created workouts', async () => {
    const token = await signupAndLogin();
    await request(app).post('/api/workouts').set('Authorization', `Bearer ${token}`).send(WORKOUT);
    const res = await request(app).get('/api/workouts').set('Authorization', `Bearer ${token}`);
    expect(res.body.workouts).toHaveLength(1);
  });
});

describe('GET /api/workouts/stats', () => {
  it('returns chart with 7 labels', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .get('/api/workouts/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.chart).toBeDefined();
    expect(res.body.chart.labels).toHaveLength(7);
    expect(res.body.chart.calories).toHaveLength(7);
  });

  it('reflects today\'s workout in the chart', async () => {
    const token = await signupAndLogin();
    await request(app).post('/api/workouts').set('Authorization', `Bearer ${token}`).send(WORKOUT);
    const statsRes = await request(app).get('/api/workouts/stats').set('Authorization', `Bearer ${token}`);
    const totalChartCals = statsRes.body.chart.calories.reduce((a, b) => a + b, 0);
    expect(totalChartCals).toBe(WORKOUT.caloriesBurned);
  });
});

// ───────────────────────────────────────────────────
// Update & Delete
// ───────────────────────────────────────────────────
describe('PUT /api/workouts/:id', () => {
  it('updates a workout', async () => {
    const token = await signupAndLogin();
    const create = await request(app).post('/api/workouts').set('Authorization', `Bearer ${token}`).send(WORKOUT);
    const id = create.body.workout._id;
    const res = await request(app)
      .put(`/api/workouts/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Evening Session' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Evening Session');
  });

  it('returns 404 for a workout owned by another user', async () => {
    const token1 = await signupAndLogin();
    const token2 = (await request(app).post('/api/auth/signup').send({
      name: 'Other User', email: 'other@fm.test', password: 'pass123',
    })).body.token;

    const create = await request(app).post('/api/workouts').set('Authorization', `Bearer ${token1}`).send(WORKOUT);
    const id = create.body.workout._id;

    const res = await request(app)
      .put(`/api/workouts/${id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Hacked' });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/workouts/:id', () => {
  it('deletes a workout', async () => {
    const token = await signupAndLogin();
    const create = await request(app).post('/api/workouts').set('Authorization', `Bearer ${token}`).send(WORKOUT);
    const id = create.body.workout._id;
    const res = await request(app).delete(`/api/workouts/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
