# TaskFlow — Team Task Manager

A production-ready MERN application for managing team projects and assigned work. It includes JWT authentication, role-based access control (Admin/Member), MongoDB relationships with Mongoose, REST APIs, and a responsive React UI with a kanban-style task board.

## Folder Structure

```text
taskflow/
  backend/
    controllers/
      authController.js
      projectController.js
      taskController.js
      dashboardController.js
    middleware/
      authMiddleware.js
    models/
      User.js
      Project.js
      Task.js
    routes/
      authRoutes.js
      projectRoutes.js
      taskRoutes.js
      dashboardRoutes.js
    .env
    package.json
    railway.toml
    server.js
  frontend/
    src/
      api/
        axios.js
      context/
        AuthContext.jsx
      pages/
        Login.jsx
        Signup.jsx
        Dashboard.jsx
        ProjectView.jsx
      App.jsx
      main.jsx
      index.css
    .env
    index.html
    package.json
    vite.config.js
  README.md
```

## Features

- Signup and login with bcrypt password hashing
- JWT auth with protected API routes
- Admin and Member roles per project
- Admin is assigned automatically when a user creates a project
- Admin can add and remove team members from projects by email
- Admin task CRUD inside projects with priority and due date support
- Member access limited to assigned tasks only
- Members can update the status of their own assigned tasks
- Kanban board with To Do, In Progress, and Done columns
- Dashboard with total, completed, in progress, and overdue task counts
- Team panel showing per-member task count
- Project progress bars broken down by status
- Railway-compatible deployment with separate backend and frontend services

## Local Setup

### 1. Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (free tier) or a local MongoDB instance

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the app in development

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm start
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`
Backend health check: `http://localhost:5000`

## Railway Deployment

1. Push this repository to GitHub.
2. Go to [railway.app](https://railway.app) and create a new project.
3. Deploy the **backend** folder as one Railway service:
   - Add environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT=5000`, `NODE_ENV=production`
   - Railway will detect `railway.toml` and run `node server.js`
   - Copy the generated backend URL (e.g. `https://taskflow-backend.up.railway.app`)
4. Deploy the **frontend** folder as a second Railway service:
   - Add environment variable: `VITE_API_URL=https://your-backend-url/api`
   - Build command: `npm run build`
   - Start command: `npx serve dist`
5. The live frontend URL is your submission link.

## Roles

- `Admin`: created automatically when a user creates a project. Can create, update, and delete tasks; add and remove team members; view all tasks in the project.
- `Member`: added to a project by the Admin via email. Can view and update the status of tasks assigned to them only.

## API Endpoints

Base URL: `/api`

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/signup` | Public | Register user and return JWT |
| POST | `/auth/login` | Public | Login and return JWT |
| GET | `/auth/me` | Authenticated | Return current user |

Signup / Login body:

```json
{
  "name": "Anuj Mishra",
  "email": "anuj@example.com",
  "password": "password123"
}
```

Response includes JWT token:

```json
{
  "_id": "USER_OBJECT_ID",
  "name": "Anuj Mishra",
  "email": "anuj@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Projects

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/projects` | Authenticated | Create project (creator becomes Admin) |
| GET | `/projects` | Authenticated | Get all projects the user is a member of |
| GET | `/projects/:id` | Project member | Get single project with members |
| POST | `/projects/:id/members` | Admin | Add member by email |
| DELETE | `/projects/:id/members/:userId` | Admin | Remove member |

Create project body:

```json
{
  "name": "Website Redesign",
  "description": "Redesign the company landing page",
  "color": "#7c6bef"
}
```

Add member body:

```json
{
  "email": "teammate@example.com",
  "role": "Member"
}
```

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/tasks` | Admin | Create task inside a project |
| GET | `/tasks/project/:projectId` | Project member | Admin sees all; Member sees own assigned tasks |
| PUT | `/tasks/:id` | Admin or assigned Member | Admin updates all fields; Member updates status only |
| DELETE | `/tasks/:id` | Admin | Delete task |

Create task body:

```json
{
  "title": "Design hero section",
  "description": "Build responsive React UI for the landing page",
  "projectId": "PROJECT_OBJECT_ID",
  "assignedTo": "USER_OBJECT_ID",
  "priority": "High",
  "dueDate": "2026-05-20",
  "status": "To Do"
}
```

### Dashboard

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/dashboard/:projectId` | Project member | Returns task stats and per-member task counts |

Response:

```json
{
  "total": 12,
  "done": 5,
  "inProgress": 4,
  "todo": 3,
  "overdue": 2,
  "members": [
    {
      "userId": "USER_OBJECT_ID",
      "name": "Anuj Mishra",
      "role": "Admin",
      "taskCount": 8
    }
  ]
}
```

## Error Format

Authentication and authorization errors return HTTP `401` and `403`. Missing resources return `404`. Validation errors return HTTP `400`:

```json
{
  "message": "Title and project are required"
}
```

Server errors return HTTP `500`:

```json
{
  "message": "Server error",
  "error": "error details"
}
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 (Vite), React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Deployment | Railway |

---

Built by **Anuj Mishra** — B.Tech CSE, BPIT GGSIPU