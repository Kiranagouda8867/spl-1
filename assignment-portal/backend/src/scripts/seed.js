'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { User } = require('../models/User');
const { Course } = require('../models/Course');
const { Assignment } = require('../models/Assignment');
const { Submission } = require('../models/Submission');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/assignment_portal';

async function seed() {
  console.log(' Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(' MongoDB connected successfully.\n');

  // 1. Create or update Demo Users
  const usersData = [
    {
      name: 'System Administrator',
      email: 'admin@portal.local',
      password: 'Admin123!',
      role: 'admin',
      department: 'Administration',
      studentId: 'ADM2024001',
    },
    {
      name: 'Dr. Alan Turing',
      email: 'faculty@portal.local',
      password: 'Faculty123!',
      role: 'faculty',
      department: 'Computer Science',
      studentId: 'FAC2024001',
    },
    {
      name: 'Alex Johnson',
      email: 'student@portal.local',
      password: 'Student123!',
      role: 'student',
      department: 'Computer Science',
      studentId: 'CS2024001',
    },
  ];

  const seededUsers = {};

  for (const userData of usersData) {
    let user = await User.findOne({ email: userData.email });
    if (user) {
      user.name = userData.name;
      user.role = userData.role;
      user.department = userData.department;
      user.studentId = userData.studentId;
      user.password = userData.password; // Triggers bcrypt pre-save hash
      await user.save();
      console.log(` Updated existing ${userData.role} account: ${userData.email}`);
    } else {
      user = new User(userData);
      await user.save();
      console.log(` Created new ${userData.role} account: ${userData.email}`);
    }
    seededUsers[userData.role] = user;
  }

  // 2. Create or update Demo Course
  let course = await Course.findOne({ code: 'CS301' });
  if (!course) {
    course = await Course.create({
      name: 'Advanced Web Technologies & Cloud Deployment',
      code: 'CS301',
      description: 'Comprehensive study of modern full-stack web applications, containerisation with Docker, and CI/CD pipelines.',
      department: 'Computer Science',
      faculty: [seededUsers.faculty._id],
      students: [seededUsers.student._id],
      createdBy: seededUsers.admin._id,
      isActive: true,
    });
    console.log(' Created demo course: CS301');
  } else {
    course.faculty = [seededUsers.faculty._id];
    if (!course.students.includes(seededUsers.student._id)) {
      course.students.push(seededUsers.student._id);
    }
    await course.save();
    console.log(' Updated demo course: CS301');
  }

  // 3. Create or update Demo Assignment
  let assignment = await Assignment.findOne({ course: course._id, title: 'Assignment 1: Containerised Microservices' });
  if (!assignment) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7 days from now

    assignment = await Assignment.create({
      title: 'Assignment 1: Containerised Microservices',
      description: 'Implement a complete RESTful API and containerise both frontend and backend using multi-stage Dockerfiles.',
      course: course._id,
      deadline,
      maxMarks: 100,
      passingMarks: 50,
      resubmissionPolicy: 'always',
      status: 'published',
      createdBy: seededUsers.faculty._id,
    });
    console.log(` Created demo assignment: ${assignment.title}`);
  }

  // 4. Create sample Submission if none exists
  let submission = await Submission.findOne({ assignment: assignment._id, student: seededUsers.student._id });
  if (!submission) {
    submission = await Submission.create({
      assignment: assignment._id,
      student: seededUsers.student._id,
      course: course._id,
      submissionText: 'GitHub Repository: https://github.com/example/assignment-portal\nDocker image deployed and verified.',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date(),
    });
    console.log(' Created demo submission for student');
  }

  console.log('\n============================================================');
  console.log('              DEMO ACCOUNTS READY FOR EVALUATION           ');
  console.log('============================================================');
  console.log('| Role    | Email                | Password    | Dashboard Route    |');
  console.log('|---------|----------------------|-------------|--------------------|');
  console.log('| Student | student@portal.local | Student123! | /student/dashboard |');
  console.log('| Faculty | faculty@portal.local | Faculty123! | /faculty/dashboard |');
  console.log('| Admin   | admin@portal.local   | Admin123!   | /admin/dashboard   |');
  console.log('============================================================\n');

  await mongoose.disconnect();
  console.log(' Database disconnected cleanly. Seed completed.');
}

seed().catch((err) => {
  console.error(' Seeding failed:', err);
  process.exit(1);
});
