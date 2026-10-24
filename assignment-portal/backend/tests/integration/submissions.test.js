'use strict';

const request = require('supertest');
const app = require('../../src/app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('../testDb');
const { User } = require('../../src/models/User');
const { Course } = require('../../src/models/Course');
const { Assignment } = require('../../src/models/Assignment');
const path = require('path');
const fs = require('fs');

process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long';
process.env.NODE_ENV = 'test';

let facultyToken, studentToken;
let faculty, student, otherStudent, course, assignment;
let testFilePath;

beforeAll(async () => {
  await setupTestDB();
  testFilePath = path.join(__dirname, 'test-assignment.pdf');
  fs.writeFileSync(testFilePath, '%PDF-1.4 Mock PDF file content for test');
});

afterAll(async () => {
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  faculty = new User({ name: 'Prof Smith', email: 'prof@test.com', password: 'Password123', role: 'faculty' });
  await faculty.save();
  student = new User({ name: 'Alice Student', email: 'alice@test.com', password: 'Password123', role: 'student', studentId: 'CS01' });
  await student.save();
  otherStudent = new User({ name: 'Bob Student', email: 'bob@test.com', password: 'Password123', role: 'student', studentId: 'CS02' });
  await otherStudent.save();

  const [fRes, sRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: 'prof@test.com', password: 'Password123' }),
    request(app).post('/api/auth/login').send({ email: 'alice@test.com', password: 'Password123' }),
  ]);

  facultyToken = fRes.body.data.token;
  studentToken = sRes.body.data.token;

  course = await Course.create({
    name: 'Operating Systems',
    code: 'CS301',
    faculty: [faculty._id],
    students: [student._id, otherStudent._id],
    createdBy: faculty._id,
  });

  assignment = await Assignment.create({
    title: 'Kernel Threads Lab',
    description: 'Implement multi-threaded scheduler',
    course: course._id,
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h from now
    maxMarks: 50,
    resubmissionPolicy: 'always',
    status: 'published',
    createdBy: faculty._id,
  });
});

describe('Assignment Submission & Versioning', () => {
  it('should accept a valid PDF submission and create version 1', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('assignmentId', assignment._id.toString())
      .field('notes', 'First version notes')
      .attach('file', testFilePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentVersion).toBe(1);
    expect(res.body.data.status).toBe('submitted');
  });

  it('should increment version number on resubmission', async () => {
    // First submission
    await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('assignmentId', assignment._id.toString())
      .attach('file', testFilePath);

    // Second submission (resubmission)
    const res2 = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('assignmentId', assignment._id.toString())
      .field('notes', 'Revised solution')
      .attach('file', testFilePath);

    expect(res2.status).toBe(201);
    expect(res2.body.data.currentVersion).toBe(2);
    expect(res2.body.data.versions.length).toBe(2);
  });

  it('should reject submission from student not enrolled in the course', async () => {
    const unEnrolledStudent = new User({ name: 'Eve', email: 'eve@test.com', password: 'Password123', role: 'student' });
    await unEnrolledStudent.save();
    const login = await request(app).post('/api/auth/login').send({ email: 'eve@test.com', password: 'Password123' });
    const eveToken = login.body.data.token;

    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${eveToken}`)
      .field('assignmentId', assignment._id.toString())
      .attach('file', testFilePath);

    expect(res.status).toBe(403);
  });
});

describe('Grading and Marks Validation', () => {
  let submissionId;

  beforeEach(async () => {
    const subRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('assignmentId', assignment._id.toString())
      .attach('file', testFilePath);
    submissionId = subRes.body.data._id;
  });

  it('faculty should successfully grade submission within maxMarks', async () => {
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        submissionId,
        marks: 45,
        feedback: 'Excellent synchronization logic',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.marks).toBe(45);
    expect(res.body.data.feedback).toBe('Excellent synchronization logic');
  });

  it('should reject marks exceeding maximum marks', async () => {
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        submissionId,
        marks: 999, // Max marks is 50
        feedback: 'Too high',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/exceed/i);
  });

  it('students should not be allowed to grade submissions', async () => {
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        submissionId,
        marks: 50,
      });

    expect(res.status).toBe(403);
  });
});
