'use strict';

const request = require('supertest');
const app = require('../../src/app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('../testDb');

// Set required env vars for tests
process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('POST /api/auth/register', () => {
  it('should register a new student successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should register a new student successfully when role is student', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'Password123',
      role: 'student',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should register a new student when role is omitted', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Default Student',
      email: 'default-student@test.com',
      password: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('student');
  });

  it('should reject unauthorized admin registration without invite key', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sneaky Admin',
      email: 'admin@test.com',
      password: 'Password123',
      role: 'admin',
    });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Admin/i);
  });

  it('should reject unauthorized faculty registration without invite key', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sneaky Faculty',
      email: 'faculty@test.com',
      password: 'Password123',
      role: 'faculty',
    });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Faculty/i);
  });

  it('should allow authorized faculty registration with valid invite code', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dr. Faculty',
      email: 'valid-faculty@test.com',
      password: 'Password123',
      role: 'faculty',
      inviteCode: 'FACULTY2024',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('faculty');
  });

  it('should allow authorized admin registration with valid invite code', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Master Admin',
      email: 'valid-admin@test.com',
      password: 'Password123',
      role: 'admin',
      inviteCode: 'ADMIN2024',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('admin');
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'Password123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'user@test.com',
      password: 'short',
    });
    expect(res.status).toBe(422);
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'First User',
      email: 'dup@test.com',
      password: 'Password123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Second User',
      email: 'dup@test.com',
      password: 'Password123',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'login@test.com',
      password: 'Password123',
    });
  });

  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'WrongPassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'notexist@test.com',
      password: 'Password123',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBeDefined();
  });

  it('readiness should return ready when DB is connected', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});
