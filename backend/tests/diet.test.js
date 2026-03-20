const request = require('supertest');
const app = require('../server');
const { connect, clearDatabase, close } = require('./helpers/testDb');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await close(); });

const signupAndLogin = async () => {
  const res = await request(app).post('/api/auth/signup').send({
    name: 'Diet Tester',
    email: 'diet@fitmind.test',
    password: 'password123',
  });
  return res.body.token;
};

const MEAL = {
  mealName: 'Chicken & Rice',
  mealType: 'lunch',
  calories: 600,
  protein: 45,
  carbs: 70,
  fats: 12,
  fiber: 5,
};

// ───────────────────────────────────────────────────
// Create
// ───────────────────────────────────────────────────
describe('POST /api/diet', () => {
  it('logs a meal successfully', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/diet')
      .set('Authorization', `Bearer ${token}`)
      .send(MEAL);
    expect(res.statusCode).toBe(201);
    expect(res.body.mealName).toBe(MEAL.mealName);
    expect(res.body.calories).toBe(MEAL.calories);
  });

  it('returns 400 when mealName is missing', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/diet')
      .set('Authorization', `Bearer ${token}`)
      .send({ calories: 400 });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when calories is missing', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/diet')
      .set('Authorization', `Bearer ${token}`)
      .send({ mealName: 'Salad' });
    expect(res.statusCode).toBe(400);
  });

  it('does not store arbitrary injected fields', async () => {
    const token = await signupAndLogin();
    const res = await request(app)
      .post('/api/diet')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...MEAL, __admin: true, __proto__: {} });
    expect(res.statusCode).toBe(201);
    expect(res.body.__admin).toBeUndefined();
  });
});

// ───────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────
describe('GET /api/diet/summary', () => {
  it('correctly aggregates today\'s macros', async () => {
    const token = await signupAndLogin();
    // Log two meals
    await request(app).post('/api/diet').set('Authorization', `Bearer ${token}`).send(MEAL);
    await request(app).post('/api/diet').set('Authorization', `Bearer ${token}`).send({
      mealName: 'Protein Shake',
      mealType: 'snack',
      calories: 200,
      protein: 30,
      carbs: 10,
      fats: 5,
    });

    const res = await request(app)
      .get('/api/diet/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.summary.calories).toBe(800);
    expect(res.body.summary.protein).toBe(75);
  });

  it('returns zeros for a fresh user', async () => {
    const token = await signupAndLogin();
    const res = await request(app).get('/api/diet/summary').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.summary.calories).toBe(0);
  });
});

// ───────────────────────────────────────────────────
// Delete
// ───────────────────────────────────────────────────
describe('DELETE /api/diet/:id', () => {
  it('deletes a meal', async () => {
    const token = await signupAndLogin();
    const create = await request(app).post('/api/diet').set('Authorization', `Bearer ${token}`).send(MEAL);
    const id = create.body._id;
    const res = await request(app).delete(`/api/diet/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
