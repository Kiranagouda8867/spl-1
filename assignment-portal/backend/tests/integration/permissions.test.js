'use strict';

const request = require('supertest');
const app = require('../../src/app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('../testDb');
const { User } = require('../../src/models/User');
const { Course } = require('../../src/models/Course');
const { Assignment } = require('../../src/models/Assignment');

process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long';
process.env.NODE_ENV = 'test';

let adminToken, facultyToken, studentToken;
let admin, faculty, student, course;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create users directly in DB to assign roles
  admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'Password123', role: 'admin' });
  await admin.save();
  faculty = new User({ name: 'Faculty', email: 'faculty@test.com', password: 'Password123', role: 'faculty' });
  await faculty.save();
  student = new User({ name: 'Student', email: 'student@test.com', password: 'Password123', role: 'student' });
  await student.save();

  // Login to get tokens
  const [adminRes, facultyRes, studentRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Password123' }),
    request(app).post('/api/auth/login').send({ email: 'faculty@test.com', password: 'Password123' }),
    request(app).post('/api/auth/login').send({ email: 'student@test.com', password: 'Password123' }),
  ]);

  adminToken = adminRes.body.data.token;
  facultyToken = facultyRes.body.data.token;
  studentToken = studentRes.body.data.token;

  // Create course
  course = await Course.create({
    name: 'Test Course',
    code: 'TC101',
    faculty: [faculty._id],
    students: [student._id],
    createdBy: admin._id,
  });

  // Create published assignment
  await Assignment.create({
    title: 'Test Assignment',
    description: 'Test description',
    course: course._id,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxMarks: 100,
    status: 'published',
    createdBy: faculty._id,
  });
});

describe('Role-based access control', () => {
  it('student should not access admin stats', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('faculty should not access admin stats', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${facultyToken}`);
    expect(res.status).toBe(403);
  });

  it('admin should access admin stats', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('student should not create assignments', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hacked', description: 'Test', course: course._id, deadline: new Date(Date.now() + 86400000), maxMarks: 100 });
    expect(res.status).toBe(403);
  });

  it('unauthenticated request should be rejected', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(401);
  });
});

describe('Deadline enforcement', () => {
  it('should reject assignment creation with past deadline', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'Past Deadline',
        description: 'Test',
        course: course._id.toString(),
        deadline: new Date(Date.now() - 86400000).toISOString(), // yesterday
        maxMarks: 100,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/future/i);
  });
});

describe('Student data isolation', () => {
  it('student should only see their own courses', async () => {
    // Create another student not enrolled in the course
    const otherStudent = new User({ name: 'Other', email: 'other@test.com', password: 'Password123', role: 'student' });
    await otherStudent.save();
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'other@test.com', password: 'Password123' });
    const otherToken = loginRes.body.data.token;

    const res = await request(app).get('/api/courses').set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0); // Other student is not enrolled
  });
});

describe('Health endpoint', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.database.connected).toBe(true);
  });

  it('GET /api/health/ready returns ready when DB connected', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.status).toBe(200);
  });
});
