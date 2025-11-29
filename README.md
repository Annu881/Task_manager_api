# 📋 Task Management System

A full-stack task management application built with **FastAPI** (Backend) and **Next.js** (Frontend), featuring real-time updates, authentication, and a beautiful modern UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)

## 🌟 Features

- ✅ **User Authentication** - Secure JWT-based authentication with login/signup
- ✅ **Task Management** - Create, read, update, delete tasks with rich metadata
- ✅ **Real-time Updates** - React Query for automatic cache invalidation and updates
- ✅ **Task Filtering** - Filter by status, priority, labels, and search
- ✅ **Labels & Categories** - Organize tasks with custom labels
- ✅ **Activity Tracking** - Complete audit log of all task changes
- ✅ **Calendar View** - Visualize tasks by due date
- ✅ **Dashboard Analytics** - Task statistics and completion tracking
- ✅ **Modern UI** - Beautiful, responsive design with dark mode support
- ✅ **Redis Caching** - Fast performance with intelligent caching

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend - Next.js 14"
        A[React Components] --> B[React Query]
        B --> C[Zustand Store]
        A --> D[Tailwind CSS]
    end
    
    subgraph "API Layer"
        E[Axios Client] --> F[JWT Auth Interceptor]
    end
    
    subgraph "Backend - FastAPI"
        G[API Routes] --> H[Services Layer]
        H --> I[Repository Layer]
        I --> J[SQLAlchemy ORM]
    end
    
    subgraph "Data Layer"
        J --> K[(PostgreSQL)]
        H --> L[(Redis Cache)]
    end
    
    A --> E
    E --> G
    
    style A fill:#9333ea
    style G fill:#10b981
    style K fill:#3b82f6
    style L fill:#ef4444
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **Redis** - Caching layer
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **React Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📦 Project Structure

```
Task_api/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # API endpoints
│   │   ├── core/                # Config & security
│   │   ├── db/                  # Database setup
│   │   ├── models/              # SQLAlchemy models
│   │   ├── repositories/        # Data access layer
│   │   ├── schemas/             # Pydantic schemas
│   │   └── services/            # Business logic
│   ├── migrations/              # Alembic migrations
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # React components
│   │   ├── lib/
│   │   │   ├── api/            # API clients
│   │   │   └── store/          # Zustand stores
│   │   └── types/              # TypeScript types
│   ├── package.json
│   └── .env.local
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Redis 7+**

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file**
   ```bash
   cat > .env << EOF
   DATABASE_URL=postgresql://user:password@localhost:5432/task_db
   REDIS_URL=redis://localhost:6379/0
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   CACHE_TTL=300
   EOF
   ```

5. **Setup database**
   ```bash
   # Create database
   createdb task_db
   
   # Run migrations
   alembic upgrade head
   
   # (Optional) Seed data
   python seed_data.py
   ```

6. **Start backend server**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Backend will be available at: **http://localhost:8000**
   
   API Docs: **http://localhost:8000/docs**

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file**
   ```bash
   cat > .env.local << EOF
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   EOF
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at: **http://localhost:3000**

## 🔑 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `SECRET_KEY` | JWT secret key | - |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry | 30 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | 7 |
| `CACHE_TTL` | Redis cache TTL (seconds) | 300 |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8000/api/v1 |

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `GET /tasks/` - List tasks (with filters)
- `POST /tasks/` - Create task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
- `GET /labels/` - List labels
- `GET /activity/` - Get activity logs

## 🎨 Features Showcase

### Dashboard
- Task statistics (total, completed, pending)
- Quick actions
- User profile

### Task Management
- Create tasks with title, description, priority, status
- Assign labels
- Set due dates
- Toggle completion status
- Edit and delete tasks

### Filtering & Search
- Filter by status (pending, in_progress, completed)
- Filter by priority (low, medium, high)
- Filter by labels
- Search by title/description
- View overdue tasks

### Activity Tracking
- Complete audit log
- Track all task changes
- User attribution

## 🐛 Bug Fixes & Improvements

Recent fixes:
- ✅ Fixed Redis cache bug (tasks disappearing)
- ✅ Fixed task completion toggle (bidirectional)
- ✅ Fixed dashboard stats real-time updates
- ✅ Fixed React Query cache invalidation
- ✅ Added comprehensive .gitignore
- ✅ Improved UI with vibrant colors
- ✅ Added proper error handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Annu881**
- GitHub: [@Annu881](https://github.com/Annu881)

## 🙏 Acknowledgments

- FastAPI for the amazing backend framework
- Next.js team for the excellent React framework
- All contributors and users of this project

---

**Made with ❤️ by Annu881**
