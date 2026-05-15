# ⚡ TaskFlow — Team Task Manager

A full-stack collaborative task management app built with **React + Node.js + MongoDB**.

---

## 🚀 Features

- **Authentication** — Signup/Login with JWT tokens
- **Project Management** — Create projects, invite team members
- **Role-Based Access** — Admin (full control) vs Member (view + update own tasks)
- **Task Management** — Create, assign, prioritize, track tasks with due dates
- **Kanban Board** — To Do / In Progress / Done columns
- **Dashboard** — Stats: total, completed, in progress, overdue tasks
- **Team Panel** — Member list with task count per person

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Deployment | Railway |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/         # User, Project, Task (Mongoose schemas)
│   ├── routes/         # auth, projects, tasks, dashboard
│   ├── controllers/    # Business logic for each route
│   ├── middleware/     # JWT auth middleware
│   ├── server.js       # Express entry point
│   └── .env            # Environment variables
└── frontend/
    └── src/
        ├── pages/      # Login, Signup, Dashboard, ProjectView
        ├── context/    # AuthContext (global user state)
        ├── api/        # Axios instance with token interceptor
        └── index.css   # Global styles
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### Backend

```bash
cd backend
npm install
```

Create `.env`:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## 🌐 Deployment on Railway

### Backend
1. Push code to GitHub
2. Create new project on [railway.app](https://railway.app)
3. Connect your GitHub repo → select `backend` folder
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT=5000`
5. Deploy → copy the generated URL

### Frontend
1. Create another Railway service → select `frontend` folder
2. Add environment variable: `VITE_API_URL=https://your-backend-url/api`
3. Build command: `npm run build`
4. Deploy

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/projects | Create project (Admin) |
| GET | /api/projects | Get my projects |
| GET | /api/projects/:id | Get project details |
| POST | /api/projects/:id/members | Add member (Admin) |
| DELETE | /api/projects/:id/members/:userId | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/tasks | Create task (Admin) |
| GET | /api/tasks/project/:projectId | Get tasks |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/:projectId | Get stats + member task counts |

---

## 👤 Role Permissions

| Action | Admin | Member |
|---|---|---|
| Create tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks only) |
| Add/remove members | ✅ | ❌ |
| View all tasks | ✅ | ❌ (own only) |

---

Built by **Anuj Mishra** — BPIT, GGSIPU
