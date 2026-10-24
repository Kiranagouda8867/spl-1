# Online Assignment Submission and Evaluation Portal — API Documentation

Base URL: `http://localhost:5000/api` (or `/api` when accessed through Nginx reverse proxy)

All protected endpoints require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication & Session

### Register Student Account
- **POST** `/auth/register`
- **Access**: Public (Note: Only student accounts can be registered publicly)
- **Body**:
  ```json
  {
    "name": "Alice Smith",
    "email": "alice@university.edu",
    "password": "Password123",
    "studentId": "CS-2024-001",
    "department": "Computer Science"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "65b...",
        "name": "Alice Smith",
        "email": "alice@university.edu",
        "role": "student",
        "studentId": "CS-2024-001"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5..."
    }
  }
  ```

### Login
- **POST** `/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "alice@university.edu",
    "password": "Password123"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "user": { "_id": "...", "name": "Alice Smith", "role": "student" },
      "token": "..."
    }
  }
  ```

### Logout
- **POST** `/auth/logout`
- **Access**: Authenticated

---

## 2. Health & Readiness

### Liveness Check
- **GET** `/health`
- **Response** `200 OK`:
  ```json
  {
    "status": "ok",
    "uptime": 124.5,
    "timestamp": "2026-10-24T18:00:00.000Z",
    "database": {
      "connected": true,
      "state": "connected"
    }
  }
  ```

### Readiness Check
- **GET** `/health/ready`
- **Response** `200 OK` (when MongoDB is connected):
  ```json
  {
    "status": "ready",
    "database": "connected"
  }
  ```
- **Response** `503 Service Unavailable` (when MongoDB is not connected):
  ```json
  {
    "status": "not_ready",
    "database": "disconnected",
    "message": "Database connection is not established."
  }
  ```

---

## 3. Users

### Get Current User Profile
- **GET** `/users/me`
- **Access**: Authenticated

### Update Current User Profile
- **PUT** `/users/me`
- **Access**: Authenticated
- **Body**: `{ "name": "...", "department": "..." }`

### List Users (Directory)
- **GET** `/users?role=student&search=alice`
- **Access**: Faculty, Admin

---

## 4. Courses

### List Courses
- **GET** `/courses`
- **Access**: Authenticated (Students see enrolled courses; Faculty see assigned courses; Admin sees all)

### Get Course Details
- **GET** `/courses/:id`
- **Access**: Authenticated (Enrolled student, assigned faculty, or admin)

### Create Course
- **POST** `/courses`
- **Access**: Admin only
- **Body**:
  ```json
  {
    "name": "Operating Systems",
    "code": "CS-301",
    "description": "Kernel architecture, process management, memory virtualisation",
    "department": "Computer Science",
    "semester": "Fall 2024"
  }
  ```

### Assign Faculty to Course
- **POST** `/courses/:id/faculty`
- **Access**: Admin only
- **Body**: `{ "facultyIds": ["65b..."] }`

### Enroll Students into Course
- **POST** `/courses/:id/enroll`
- **Access**: Admin only
- **Body**: `{ "studentIds": ["65b..."] }`

---

## 5. Assignments

### List Assignments
- **GET** `/assignments?courseId=65b...&status=published`
- **Access**: Authenticated

### Get Assignment by ID
- **GET** `/assignments/:id`
- **Access**: Authenticated

### Create Assignment
- **POST** `/assignments`
- **Access**: Faculty (assigned to the course) or Admin
- **Body**:
  ```json
  {
    "title": "Lab 1: Process Synchronization",
    "description": "Implement reader-writer locks using POSIX semaphores",
    "course": "65b...",
    "deadline": "2026-11-01T23:59:59.000Z",
    "maxMarks": 100,
    "resubmissionPolicy": "before_deadline",
    "status": "published"
  }
  ```

### Update Assignment
- **PUT** `/assignments/:id`
- **Access**: Faculty (author) or Admin

### Delete Assignment
- **DELETE** `/assignments/:id`
- **Access**: Faculty (author) or Admin

---

## 6. Submissions

### Submit / Resubmit Assignment
- **POST** `/submissions`
- **Access**: Student (enrolled in course)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `assignmentId` (string, required)
  - `notes` (string, optional)
  - `file` (file binary, max 10MB, accepted extensions: `.pdf`, `.docx`, `.doc`, `.zip`)
- **Behavior**:
  - If no prior submission exists: creates version 1.
  - If prior submission exists and resubmission is allowed: increments version number and archives past version history.
  - Timestamp checked against deadline; marked `late` if submitted after deadline.

### Get My Submissions
- **GET** `/submissions/mine`
- **Access**: Student

### Get Submissions for Assignment
- **GET** `/submissions/assignment/:assignmentId?status=submitted`
- **Access**: Faculty (assigned to course) or Admin

### Download Submission File
- **GET** `/submissions/:id/download`
- **Access**: The student who submitted it, assigned faculty, or admin

---

## 7. Evaluations & Grading

### Grade / Evaluate Submission
- **POST** `/evaluations`
- **Access**: Faculty (assigned to course) or Admin
- **Body**:
  ```json
  {
    "submissionId": "65b...",
    "marks": 92.5,
    "feedback": "Outstanding synchronization and cleanly commented code."
  }
  ```

### Get Evaluations for Assignment
- **GET** `/evaluations/assignment/:assignmentId`
- **Access**: Faculty or Admin

### Get My Evaluations (Grades)
- **GET** `/evaluations/mine`
- **Access**: Student

### Export Gradebook CSV
- **GET** `/evaluations/assignment/:assignmentId/export`
- **Access**: Faculty or Admin
- **Response**: `text/csv` attachment file download

---

## 8. Notifications

### List Notifications
- **GET** `/notifications`
- **Access**: Authenticated

### Mark Notification as Read
- **PUT** `/notifications/:id/read`
- **Access**: Recipient user

### Mark All as Read
- **PUT** `/notifications/read-all`
- **Access**: Recipient user

---

## 9. Admin Operations

### Get System Dashboard Stats
- **GET** `/admin/stats`
- **Access**: Admin only
- **Response**: Total counts of users, students, faculty, courses, assignments, and submissions.

### Provision User Account
- **POST** `/admin/users`
- **Access**: Admin only
- **Body**:
  ```json
  {
    "name": "Dr. Donald Knuth",
    "email": "knuth@university.edu",
    "password": "SecurePassword123",
    "role": "faculty",
    "department": "Computer Science"
  }
  ```
