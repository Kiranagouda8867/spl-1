# Architecture & System Design Document
## Online Assignment Submission and Evaluation Portal

This document outlines the architecture, data flow, component design, container topology, and CI/CD automation pipeline for the **Online Assignment Submission and Evaluation Portal**.

---

## 1. High-Level Architectural Overview

The application follows a modern decoupled client-server architecture containerised with Docker and orchestrated via Docker Compose and Jenkins:

```
+-------------------------------------------------------------------------+
|                              USER BROWSER                               |
|              (Student, Faculty, or Institutional Admin)                 |
+-------------------------------------------------------------------------+
                                    |
                                    | HTTP / HTTPS (Port 3000 -> 80)
                                    v
+-------------------------------------------------------------------------+
|                  FRONTEND CONTAINER (Nginx Alpine)                      |
|                                                                         |
|  +---------------------------+        +------------------------------+  |
|  | Built Static Assets       |        | Nginx Reverse Proxy          |  |
|  | (React 18 SPA + Vite)     |        |                              |  |
|  | - Glassmorphism UI tokens |        | - Route / -> index.html (SPA)|  |
|  | - Tailwind + Framer Motion|        | - Route /api/* -> Backend    |  |
|  | - Lucide Icons + Recharts |        | - Max upload: 15MB           |  |
|  +---------------------------+        +------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                                    | Internal Docker Bridge Network (Port 5000)
                                    v
+-------------------------------------------------------------------------+
|                  BACKEND CONTAINER (Node.js 20 LTS)                     |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Express HTTP Server (src/server.js & src/app.js)                  |  |
|  |                                                                   |  |
|  |  [Security & Rate Limit Middleware]                               |  |
|  |    Helmet | CORS | Express-Rate-Limit (100 req/15min)             |  |
|  |                                                                   |  |
|  |  [Authentication & Authorization Middleware]                      |  |
|  |    JWT Bearer Token Extraction -> User Hydration -> Role Check    |  |
|  |                                                                   |  |
|  |  [Validation Layer]                                               |  |
|  |    express-validator schemas (sanitize & validate input)          |  |
|  |                                                                   |  |
|  |  [Controllers & Domain Services]                                  |  |
|  |    Auth | Users | Courses | Assignments | Submissions | Grading   |  |
|  |                                                                   |  |
|  |  [Storage Engine]                                                 |  |
|  |    Multer (Disk Storage) -> /app/uploads (Mounted Persistent Vol) |  |
|  |                                                                   |  |
|  |  [ODM Layer]                                                      |  |
|  |    Mongoose Schema Models (User, Course, Assignment, Submission)  |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                                    | TCP Connection (process.env.MONGODB_URI)
                                    v
+-------------------------------------------------------------------------+
|                            MONGODB SERVER                               |
|                                                                         |
|  Option A: MongoDB Atlas / Remote Cluster                               |
|  Option B: Local MongoDB Server (Accessed via MongoDB Compass GUI)      |
|  Option C: Optional Containerised MongoDB (docker compose --profile local-db)|
+-------------------------------------------------------------------------+
```

---

## 2. Backend Layered Architecture Pattern

The Express backend strictly enforces the single-responsibility principle:

```
Request
   │
   ▼
[Routes] ────────► Define HTTP verbs, endpoints, and chain middleware
   │
   ▼
[Middleware] ────► Verify JWT tokens (`authenticate`), enforce roles (`authorize('faculty')`)
   │
   ▼
[Validators] ────► Enforce schemas using `express-validator` (reject early with 422)
   │
   ▼
[Controllers] ───► Handle HTTP request extraction, response formatting, status codes
   │
   ▼
[Services] ──────► Encapsulate reusable business logic (deadline validation, grading calculations)
   │
   ▼
[Mongoose Models]► Enforce schema constraints, hooks, password hashing, and DB operations
   │
   ▼
MongoDB
```

---

## 3. Security Architecture

1. **Password Hashing**: Passwords are automatically hashed with `bcryptjs` using a salt factor of 10 in the `User` pre-save hook. Passwords are never returned in JSON responses (`toPublicJSON()` removes the password hash).
2. **JWT Authentication**: Tokens are cryptographically signed using `jsonwebtoken` with HMAC-SHA256 (`process.env.JWT_SECRET`) and expire within 7 days.
3. **Role Elevation Prevention**: The public `/api/auth/register` route strictly overrides any client-supplied role to `student`. Creation of `faculty` or `admin` accounts is restricted exclusively to authenticated administrators via `/api/admin/users`.
4. **Student Data Isolation**:
   - Students can only view assignments and courses they are actively enrolled in.
   - Submissions made by students are private; students cannot inspect or download submissions from other students.
   - Faculty can only grade assignments belonging to courses they are assigned to teach.
5. **Deadline Enforcement**: Deadlines are validated against the server clock in UTC. Late submissions are flagged with `status: 'late'`, and assignments with strict policies reject submissions past the deadline.
6. **File Upload Security**:
   - Multer restricts accepted file types to PDF, DOCX, DOC, and ZIP.
   - Maximum upload size is enforced (10 MB).
   - Randomised unique filenames prevent path traversal attacks.
   - Uploaded files are preserved across container lifecycles via named Docker volumes.

---

## 4. Docker Containerisation Strategy

### Backend Image (`assignment-portal-backend`)
- **Base**: `node:20-alpine` (minimal attack surface, fast pull times).
- **Multi-stage**:
  - `deps` stage installs production dependencies using lockfile.
  - `runner` stage creates a dedicated non-root user (`appuser:nodejs`, UID 1001) for container execution.
- **Data Persistence**: `/app/uploads` is mounted to `backend-uploads` named volume.
- **Health Check**: Runs `wget -qO- http://localhost:5000/api/health` every 30 seconds.

### Frontend Image (`assignment-portal-frontend`)
- **Stage 1 (Builder)**: `node:20-alpine` runs `npm ci` and `npm run build` using Vite.
- **Stage 2 (Server)**: `nginx:alpine` serves static files and reverse-proxies `/api` requests to `http://backend:5000`.
- **SPA Routing**: `try_files $uri $uri/ /index.html` prevents 404 errors when refreshing React Router routes.
- **Health Check**: Probes `http://localhost:80/` every 30 seconds.

---

## 5. Jenkins CI/CD Automation Pipeline

The pipeline is defined declaratively in `Jenkinsfile` and covers 15 deterministic stages:

```
[1. Checkout]
      │
[2. Install Frontend Deps] ──► [3. Install Backend Deps]
      │
[4. Frontend Lint]        ──► [5. Backend Lint]
      │
[6. Frontend Tests]       ──► [7. Backend Tests (InMemory DB)]
      │
[8. Frontend Vite Build]  ──► [9. Backend Module Verification]
      │
[10. Build Backend Image] ──► [11. Build Frontend Image]
      │
[12. Tag Docker Images]
      │
[13. Optional Docker Hub Push] (skipped cleanly if credentials missing)
      │
[14. Optional Deployment Hook]
      │
[15. Post-Build Reporting & Cleanup]
```

### In-Memory Database for CI Pipeline
Tests run using `mongodb-memory-server`. This ensures CI builds never fail due to external database connectivity and run in complete isolation.
