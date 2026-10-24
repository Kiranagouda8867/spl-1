# Online Assignment Submission and Evaluation Portal
### Full-Stack Academic Management Platform with Docker & Jenkins CI/CD

An enterprise-grade, role-based academic portal built with **React 18, Node.js 20, Express, MongoDB, Docker, and Jenkins**. Designed with a modern dark **Glassmorphism** UI, role-based access control (Student, Faculty, Admin), versioned assignment submissions, and a complete 15-stage declarative Jenkins automation pipeline.

---

## 1. Key Features

- **Three Role-Based Portals**:
  - **Student**: View enrolled courses, deadlines, submit assignments (PDF, DOCX, ZIP up to 10 MB), resubmission policies, track version history, view grades & constructive feedback.
  - **Faculty**: Manage courses, create assignments with deadlines & max marks, review & download submissions, grade with feedback, and export gradebook to CSV.
  - **Administrator**: Global analytics, provision faculty/student accounts, assign faculty to courses, enroll students, audit assignments.
- **Glassmorphism SaaS Aesthetic**: Midnight Navy (`#101828`), Electric Teal (`#14B8A6`), and Soft Violet (`#A78BFA`), subtle backdrop-blur panels, and smooth Framer Motion micro-interactions.
- **Docker Containerisation**: Multi-stage Dockerfiles for backend and frontend, Nginx reverse proxy with SPA routing fallback, health checks, and named persistent volumes.
- **Academic Jenkins Demonstration**: Production-ready declarative `Jenkinsfile` with 15 stages: checkout, linting, tests, build, Docker image creation, tagging, optional Docker Hub push, and deployment hooks.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Framer Motion, Lucide Icons, Recharts |
| **Backend** | Node.js 20 LTS, Express.js, MongoDB / Mongoose, JWT, bcryptjs, Multer, Helmet, express-rate-limit, express-validator |
| **DevOps** | Docker, Docker Desktop, Docker Compose, Nginx, Jenkins Declarative Pipeline, Git / GitHub |

---

## 3. Project Structure

```
assignment-portal/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Reusable GlassCard, StatCard, GradientButton, FormField, etc.
│   │   │   ├── common/           # Modal, ConfirmDialog, FileDropzone
│   │   │   ├── layout/           # AppSidebar, AppHeader
│   │   │   └── assignments/      # AssignmentCard
│   │   ├── pages/
│   │   │   ├── auth/             # LoginPage, RegisterPage
│   │   │   ├── student/          # Dashboard, Courses, Assignments, Submissions, Grades, Notifications
│   │   │   ├── faculty/          # Dashboard, Courses, Assignments, Submissions, Grades
│   │   │   └── admin/            # Dashboard, Users, Courses, Assignments
│   │   ├── layouts/              # DashboardLayout
│   │   ├── routes/               # ProtectedRoute, PublicOnlyRoute
│   │   ├── services/             # Axios API service layer (api.js, index.js)
│   │   ├── contexts/             # AuthContext, ToastContext
│   │   ├── App.jsx               # Main React router
│   │   ├── main.jsx              # Application bootstrap
│   │   └── index.css             # Glassmorphism tokens & Tailwind utilities
│   ├── Dockerfile                # Multi-stage Vite build + Nginx Alpine
│   ├── .dockerignore
│   ├── nginx.conf                # Nginx reverse proxy & SPA fallback
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/               # Database connection manager (db.js)
│   │   ├── models/               # User, Course, Assignment, Submission, Evaluation, Notification, AuditLog
│   │   ├── controllers/          # Auth, Users, Courses, Assignments, Submissions, Evaluations, Admin
│   │   ├── routes/               # Express route definitions
│   │   ├── middleware/           # Auth, Authorization, File upload (Multer), Error handling
│   │   ├── app.js                # Express app configuration
│   │   └── server.js             # HTTP server entry point
│   ├── tests/
│   │   ├── testDb.js             # MongoMemoryServer isolated test environment
│   │   ├── unit/                 # Auth unit tests
│   │   └── integration/          # Permissions, submissions, and grading tests
│   ├── uploads/                  # Submitted files directory (.gitkeep)
│   ├── Dockerfile                # Multi-stage non-root Node.js 20 image
│   ├── .dockerignore
│   └── package.json
├── docs/
│   ├── API.md                    # Complete REST API reference
│   └── ARCHITECTURE.md           # Architecture diagrams & security design
├── infrastructure/
│   └── jenkins/                  # Dockerfile.jenkins, docker-compose.jenkins.yml, plugins.txt
├── .github/
│   └── workflows/ci.yml          # GitHub Actions workflow
├── .gitignore
├── .env.example                  # Environment variable template
├── package.json                  # Root monorepo workspace scripts
├── docker-compose.yml            # Multi-container orchestration
├── Jenkinsfile                   # Declarative 15-stage CI/CD pipeline
└── README.md
```

---

## 4. Local Installation & Setup

### Prerequisites
- Node.js 20+ LTS
- npm 9+
- Docker & Docker Desktop (optional for local non-containerised run)

### Step 1: Install Dependencies
From the project root:
```bash
# Install frontend and backend dependencies
npm run install:all
```
Or individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```

Edit `backend/.env` with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

> **IMPORTANT**: Leave `MONGODB_URI` blank until you have your MongoDB server running.

---

## 5. MongoDB & MongoDB Compass Connection Guide

The application connects to MongoDB using `process.env.MONGODB_URI`.

### Where to add your MongoDB connection URL:
Open `backend/.env` (and root `.env` for Docker Compose) and assign:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/assignment_portal?retryWrites=true&w=majority
```
Or for a local MongoDB server:
```env
MONGODB_URI=mongodb://localhost:27017/assignment_portal
```

### Connecting with MongoDB Compass:
MongoDB Compass is a GUI desktop client. It connects to the exact same MongoDB instance as your backend:

1. Open **MongoDB Compass**.
2. In the "New Connection" field, paste the **exact same connection string** you used in your `.env` file (e.g. `mongodb://localhost:27017` or your MongoDB Atlas connection string).
3. Click **Connect**.
4. You will see the database named `assignment_portal`.
5. Under `assignment_portal`, you can browse collections:
   - `users`
   - `courses`
   - `assignments`
   - `submissions`
   - `evaluations`
   - `notifications`
   - `auditlogs`

> **Note**: Both MongoDB Compass and the backend application must use the same database connection URL. If you run the backend inside Docker and your MongoDB is on your host machine, use `mongodb://host.docker.internal:27017/assignment_portal` in your Docker environment.

---

## 6. Running the Application Locally (Development Mode)

### Running the Backend:
```bash
cd backend
npm run dev
```
The backend server runs on `http://localhost:5000`.

### Running the Frontend:
```bash
cd frontend
npm run dev
```
The Vite development server runs on `http://localhost:3000` (or `http://localhost:5173`). In development, Vite automatically proxies `/api` calls to `http://localhost:5000`.

---

## 7. Running with Docker & Docker Compose

Docker containerisation is a primary demonstration of this project.

### Available Docker Compose Commands:

```bash
# 1. Validate Docker Compose configuration
docker compose config

# 2. Build both images (frontend and backend)
docker compose build

# 3. Start containers in detached mode (using your configured MONGODB_URI)
docker compose up -d

# 4. View running container status
docker compose ps

# 5. Follow live logs
docker compose logs -f backend
docker compose logs -f frontend

# 6. Stop and remove containers
docker compose down
```

### Optional Local Containerised MongoDB:
If you want Docker Compose to spin up a local MongoDB container alongside the app, use the `local-db` profile:
```bash
docker compose --profile local-db up -d
```
Then set `MONGODB_URI=mongodb://mongodb:27017/assignment_portal` in your environment.

### Building Docker Images Individually:
```bash
# Build Backend Image
docker build -t assignment-portal-backend:latest ./backend

# Build Frontend Image
docker build -t assignment-portal-frontend:latest ./frontend
```

---

## 8. Jenkins CI/CD Setup & Execution Guide

This project includes a declarative `Jenkinsfile` with 15 stages.

### 8.1 Prerequisites
1. **Docker Desktop** installed and running.
2. **Jenkins** installed locally or running in a container.

### 8.2 Recommended: Running Jenkins via Docker Compose
We provide pre-configured Jenkins infrastructure in `infrastructure/jenkins/`:

```bash
cd infrastructure/jenkins
docker compose -f docker-compose.jenkins.yml up -d
```
Access Jenkins at `http://localhost:8080`.
To retrieve the initial admin password:
```bash
docker logs jenkins-ci
```

### 8.3 Required Jenkins Plugins
Ensure these plugins are installed (**Manage Jenkins** -> **Plugins** -> **Available Plugins**):
- **Git Plugin**
- **Pipeline** (Workflow Aggregator)
- **NodeJS Plugin**
- **Docker Pipeline** / **Docker plugin**
- **AnsiColor**
- **Credentials Binding Plugin**

### 8.4 Node.js Tool Configuration in Jenkins
1. Go to **Manage Jenkins** -> **Tools**.
2. Scroll to **NodeJS installations** -> Click **Add NodeJS**.
3. Name: `NodeJS 20` (or ensure Node.js 20 is installed on the agent).
4. Select "Install automatically" -> Version: `NodeJS 20.x`.

### 8.5 Docker Access for Jenkins Agent
For Jenkins to build Docker images, the `jenkins` user must have access to the Docker daemon:
- On Linux/macOS host: Jenkins mounts `/var/run/docker.sock`.
- On Windows Docker Desktop: Ensure "Expose daemon on tcp://localhost:2375 without TLS" or Docker Desktop integration is enabled.
> **Security Notice**: Mounting the host Docker socket (`/var/run/docker.sock`) grants the Jenkins container root-level control over the host Docker daemon. For production enterprise deployments, use isolated DinD (Docker-in-Docker) sidecars or ephemeral Kubernetes pods. For college demonstrations, host socket mounting is the standard approach.

### 8.6 Setting up the Jenkins Pipeline Job
1. Go to **Jenkins Dashboard** -> Click **New Item**.
2. Enter item name: `assignment-portal-pipeline`.
3. Select **Pipeline** -> Click **OK**.
4. In the Job configuration:
   - Scroll to the **Pipeline** section.
   - Definition: Select **Pipeline script from SCM**.
   - SCM: Select **Git**.
   - Repository URL: Enter your GitHub repository URL (e.g. `https://github.com/your-username/assignment-portal.git`).
   - Branch Specifier: `*/main` or `*/master`.
   - Script Path: `Jenkinsfile` (points to the file in the project root).
5. Click **Save**.

### 8.7 Configuring Docker Hub Credentials (Optional)
If you want Jenkins to push images to Docker Hub:
1. Go to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials**.
2. Click **Add Credentials**.
3. Kind: **Username with password**.
4. Username: Your Docker Hub username.
5. Password: Your Docker Hub Personal Access Token (PAT).
6. ID: `dockerhub-credentials` (matches the `DOCKER_CREDENTIALS_ID` in `Jenkinsfile`).
7. Click **Create**.
> If credentials are not configured, Stage 13 automatically and cleanly skips publishing without failing the build.

### 8.8 Executing the Pipeline
1. In your Pipeline job, click **Build Now**.
2. Click on the active build number (e.g., `#1`) -> **Console Output** to watch the real-time execution of all 15 stages.
3. Upon completion, verify the generated Docker images on your host:
   ```bash
   docker images | grep assignment-portal
   ```

---

## 9. Connecting to GitHub

To push this codebase to your own GitHub repository:

```bash
# 1. Initialize Git (if not already initialized)
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "feat: complete Online Assignment Submission and Evaluation Portal with Docker and Jenkins"

# 4. Set default branch to main
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 10. Automated Tests & Verification

Automated tests are isolated and run using an in-memory database (`mongodb-memory-server`), ensuring they succeed without requiring an external database connection:

```bash
# Run backend test suite
cd backend
npm test

# Run backend test coverage
npm run test:coverage

# Run frontend linting
cd ../frontend
npm run lint

# Run frontend production build
npm run build
```

---

## 11. What Remains to Configure

1. **MongoDB Connection**: Add your MongoDB URL in `backend/.env` (and root `.env` for Docker Compose).
2. **GitHub Remote**: Run `git remote add origin <your-url>` and push your repository.
3. **Jenkins SCM**: Point your Jenkins Pipeline job to your new GitHub repository URL.
