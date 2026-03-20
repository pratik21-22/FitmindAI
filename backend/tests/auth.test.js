const request = require('supertest');
const app = require('../server');
const { connect, clearDatabase, close } = require('./helpers/testDb');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => {
  await close();
  app.closeAllConnections?.();
});

const TEST_USER = {
  name: 'Test Athlete',
  email: 'athlete@fitmind.test',
  password: 'password123',
  weight: 75,
  height: 175,
  age: 25,
  gender: 'male',
  goal: 'build_muscle',
  activityLevel: 'moderate',
};

// ───────────────────────────────────────────────────
// Helper: sign up and return token
// ───────────────────────────────────────────────────
const signupAndGetToken = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ ...TEST_USER, ...overrides });
  return { token: res.body.token, user: res.body };
};

// ───────────────────────────────────────────────────
// Auth — Signup
// ───────────────────────────────────────────────────
describe('POST /api/auth/signup', () => {
  it('creates a new user and returns a JWT', async () => {
    const res = await request(app).post('/api/auth/signup').send(TEST_USER);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(TEST_USER.email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 400 when email is already registered', async () => {
    await request(app).post('/api/auth/signup').send(TEST_USER);
    const res = await request(app).post('/api/auth/signup').send(TEST_USER);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'x@x.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('awards the Welcome badge on signup', async () => {
    const res = await request(app).post('/api/auth/signup').send(TEST_USER);
    expect(res.body.badges).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Welcome!' })])
    );
  });
});

// ───────────────────────────────────────────────────
// Auth — Login
// ───────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/signup').send(TEST_USER);
  });

  it('returns a JWT for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.name).toBe(TEST_USER.name);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_USER.email,
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_USER.email });
    expect(res.statusCode).toBe(400);
  });
});

// ───────────────────────────────────────────────────
// Auth — GET /me
// ───────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns the current user when authenticated', async () => {
    const { token } = await signupAndGetToken();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(TEST_USER.email);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

// ───────────────────────────────────────────────────
// Auth — PUT /profile (password change guard)
// ───────────────────────────────────────────────────
describe('PUT /api/auth/profile', () => {
  it('updates profile fields successfully', async () => {
    const { token } = await signupAndGetToken();
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', weight: 80 });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.weight).toBe(80);
  });

  it('rejects password change without currentPassword', async () => {
    const { token } = await signupAndGetToken();
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'newpass123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/current password/i);
  });

  it('rejects password change with wrong currentPassword', async () => {
    const { token } = await signupAndGetToken();
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpass', newPassword: 'newpass123' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/incorrect/i);
  });

  it('allows password change with correct currentPassword', async () => {
    const { token } = await signupAndGetToken();
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: TEST_USER.password, newPassword: 'newpass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('does not allow injecting arbitrary fields (e.g. xp)', async () => {
    const { token } = await signupAndGetToken();
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ xp: 999999, level: 100 });
    // xp and level should not be updated
    expect(res.body.xp).toBe(0);
    expect(res.body.level).toBe(1);
  });
});
