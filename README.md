# 📋 Task Management System

<div align="center">

![Task Management](https://img.shields.io/badge/Task-Management-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)

A modern, full-stack task management application with real-time analytics, built with Next.js and FastAPI.

[🚀 Live Demo](https://task-manager-frontend-a2q1.onrender.com) • [📖 API Docs](https://task-manager-api-zsjf.onrender.com/docs) • [🐛 Report Bug](https://github.com/Annu881/Task_manager_api/issues)

</div>

---

## 📑 Table of Contents

- [🎯 Overview](#-overview)
- [🏗️ Architecture](#️-architecture)
- [✨ Features](#-features)
- [🚀 Live Deployment](#-live-deployment)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Getting Started](#-getting-started)
- [🌐 Deployment Guide](#-deployment-guide)
- [📊 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

Task Management System is a production-ready application that helps teams and individuals organize, track, and analyze their tasks efficiently. With an intuitive dashboard featuring real-time analytics through pie charts and bar graphs, users can visualize their productivity at a glance.

### Key Highlights

- 📊 **Visual Analytics** - Real-time charts for task insights
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt hashing
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **High Performance** - Optimized with Redis caching
- 🎨 **Modern UI** - Built with TailwindCSS and Shadcn/UI

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                      (Web Browser / Mobile)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Render                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │ React Query  │  │   Zustand    │          │
│  │   App Router │  │    Cache     │  │    State     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - Render                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   FastAPI    │  │     JWT      │  │  SQLAlchemy  │          │
│  │    Server    │  │     Auth     │  │     ORM      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
    ┌───────────────────┐     ┌───────────────────┐
    │   PostgreSQL      │     │      Redis        │
    │   (Neon)          │     │    (Upstash)      │
    │   Primary DB      │     │     Cache         │
    └───────────────────┘     └───────────────────┘
```

### Request Flow

```
1. User Action (Browser)
   ↓
2. Next.js Frontend (Render)
   ↓
3. API Request → FastAPI Backend (Render)
   ↓
4. JWT Validation
   ↓
5. Check Redis Cache
   ├─ Cache Hit → Return Data
   └─ Cache Miss → Query PostgreSQL
   ↓
6. Return JSON Response
   ↓
7. Update UI with Charts/Data
```

### Tech Stack Overview

**Frontend Stack:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS + Shadcn/UI
- React Query (Data Fetching)
- Zustand (State Management)
- Recharts (Analytics)

**Backend Stack:**
- FastAPI (Python 3.12)
- PostgreSQL (Neon)
- SQLAlchemy ORM
- Redis (Upstash)
- JWT Authentication
- Bcrypt Password Hashing


---

## ✨ Features

### 📊 Dashboard Analytics
- **Pie Chart** - Visual breakdown of task status (Completed/Pending/Overdue)
- **Bar Graph** - Priority-based task distribution (High/Medium/Low)
- **Real-time Updates** - Automatic refresh on task changes

### ✅ Task Management
- Create, Read, Update, Delete (CRUD) operations
- Soft delete with restore functionality
- Priority levels (High, Medium, Low)
- Status tracking (Todo, In Progress, Completed)
- Due date management with overdue detection

### 🏷️ Organization
- Custom labels and categories
- Advanced filtering options
- Search functionality
- Calendar view for scheduling

### 🔐 Security
- JWT-based authentication
- Bcrypt password hashing
- Secure token refresh mechanism
- Protected API endpoints

### 📱 User Experience
- Responsive design for all screen sizes
- Dark mode support
- Smooth animations and transitions
- Intuitive navigation

---

## 🚀 Live Deployment

| Service | Platform | URL | Status |
|---------|----------|-----|--------|
| **Frontend** | Render | [task-manager-frontend-a2q1.onrender.com](https://task-manager-frontend-a2q1.onrender.com) | ![Status](https://img.shields.io/badge/status-live-success) |
| **Backend API** | Render | [task-manager-api-zsjf.onrender.com](https://task-manager-api-zsjf.onrender.com) | ![Status](https://img.shields.io/badge/status-live-success) |
| **API Docs** | Render | [/docs](https://task-manager-api-zsjf.onrender.com/docs) | ![Status](https://img.shields.io/badge/status-live-success) |
| **Health Check** | Render | [/health](https://task-manager-api-zsjf.onrender.com/health) | ![Status](https://img.shields.io/badge/status-healthy-success) |

### Database & Cache Services

| Service | Provider | Purpose | Free Tier |
|---------|----------|---------|-----------|
| **PostgreSQL** | [Neon](https://neon.tech) | Primary database | ✅ Available |
| **Redis** | [Upstash](https://upstash.com) | Caching & Sessions | ✅ Available |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | React Framework | 14.0.4 |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety | 5.x |
| [TailwindCSS](https://tailwindcss.com/) | Styling | 3.x |
| [Shadcn/UI](https://ui.shadcn.com/) | UI Components | Latest |
| [React Query](https://tanstack.com/query) | Data Fetching | 5.x |
| [Zustand](https://zustand-demo.pmnd.rs/) | State Management | 4.x |
| [Recharts](https://recharts.org/) | Data Visualization | 2.x |
| [Axios](https://axios-http.com/) | HTTP Client | 1.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | Web Framework | 0.110+ |
| [Python](https://www.python.org/) | Language | 3.12 |
| [PostgreSQL](https://www.postgresql.org/) | Database | 15+ |
| [SQLAlchemy](https://www.sqlalchemy.org/) | ORM | 2.0+ |
| [Alembic](https://alembic.sqlalchemy.org/) | Migrations | 1.13+ |
| [Redis](https://redis.io/) | Cache | 5.0+ |
| [Pydantic](https://docs.pydantic.dev/) | Validation | 2.6+ |
| [python-jose](https://python-jose.readthedocs.io/) | JWT | 3.3+ |
| [passlib](https://passlib.readthedocs.io/) | Password Hashing | 1.7+ |

---

## 📦 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
Python >= 3.12
PostgreSQL >= 15
Redis >= 5.0 (optional)
```

### Quick Start

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/Annu881/Task_manager_api.git
cd Task_manager_api
```

#### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations (if using Alembic)
alembic upgrade head

# Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend runs on:** `http://localhost:8000`

#### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with API URL

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

### Environment Variables

#### Backend `.env`
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/taskdb
SECRET_KEY=your-super-secret-key-min-32-chars
REDIS_URL=redis://localhost:6379  # Optional
PORT=8000
```

#### Frontend `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🌐 Deployment Guide

### Backend Deployment (Railway)

1. **Create Project**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select `Annu881/Task_manager_api`

2. **Configure Service**
   - Set root directory: `backend`
   - Add PostgreSQL database (Railway will auto-provision)

3. **Environment Variables**
   ```bash
   DATABASE_URL=<auto-set-by-railway>
   SECRET_KEY=<generate-secure-key>
   PORT=8000
   ```

4. **Deploy**
   - Railway auto-deploys on push to `main`
   - Generate domain in Settings → Networking

### Frontend Deployment (Vercel)

1. **Import Project**
   - Go to [Vercel](https://vercel.com)
   - Import `Annu881/Task_manager_api`
   - Set root directory: `frontend`

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
   ```

3. **Deploy**
   - Vercel auto-deploys on push to `main`
   - Custom domain available in Settings

---

## 📊 API Documentation

### Interactive Docs

- **Swagger UI:** [https://task-manager-api-zsjf.onrender.com/docs](https://task-manager-api-zsjf.onrender.com/docs)
- **ReDoc:** [https://task-manager-api-zsjf.onrender.com/redoc](https://task-manager-api-zsjf.onrender.com/redoc)

### Key Endpoints

#### Authentication Endpoints (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Create new user account |
| POST | `/api/v1/auth/login` | User login with credentials |
| POST | `/api/v1/auth/refresh` | Refresh access token |

#### Protected Endpoints (Requires Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/me` | Get current user profile |
| GET | `/api/v1/tasks/` | List all user tasks |
| POST | `/api/v1/tasks/` | Create new task |
| GET | `/api/v1/tasks/{id}/` | Get specific task details |
| PUT | `/api/v1/tasks/{id}/` | Update task information |
| DELETE | `/api/v1/tasks/{id}/` | Delete task (soft delete) |
| POST | `/api/v1/tasks/{id}/restore/` | Restore deleted task |
| GET | `/api/v1/labels/` | List all labels |
| POST | `/api/v1/labels/` | Create new label |
| GET | `/api/v1/activity/` | Get activity logs |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open Pull Request**

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Annu881**

- GitHub: [@Annu881](https://github.com/Annu881)
- Repository: [Task_manager_api](https://github.com/Annu881/Task_manager_api)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework
- [Recharts](https://recharts.org/) - Composable charting library
- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful UI components
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Infrastructure platform (Previous)
- [Render](https://render.com) - Cloud hosting platform (Current)
- [Vercel](https://vercel.com) - Frontend deployment platform (Previous)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Annu881](https://github.com/Annu881)

</div>
