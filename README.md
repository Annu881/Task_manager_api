# Task Management System

A full-stack task management application with analytics dashboard, built with Next.js and FastAPI.

## 🚀 Live Deployment

### Frontend (Vercel)
**URL:** https://task-manager-api-eta-sepia.vercel.app

### Backend (Railway)
**URL:** https://taskmanagerapi-production-8a33.up.railway.app

**API Health Check:** https://taskmanagerapi-production-8a33.up.railway.app/health

### Database & Cache Services

**PostgreSQL (Neon):**
- **Provider:** [Neon](https://neon.tech)
- **Purpose:** Primary database for storing users, tasks, labels, and activity logs
- **Free Tier:** ✅ Available

**Redis:**
- **Provider:** [Upstash](https://upstash.com) or [Redis Cloud](https://redis.com/try-free/)
- **Purpose:** Caching and session management (Optional)
- **Free Tier:** ✅ Available

---

## ✨ Features

- 📊 **Dashboard Analytics** - Pie chart and bar graph for task statistics
- ✅ **Task Management** - Create, update, delete, and restore tasks
- 🏷️ **Labels & Categories** - Organize tasks with custom labels
- 📅 **Calendar View** - Visual task scheduling
- 🔐 **Authentication** - Secure login and signup
- 📱 **Responsive Design** - Works on all devices

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Data Fetching:** React Query
- **Charts:** Recharts
- **UI Components:** Shadcn/UI

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt
- **Cache:** Redis

---

## 📦 Local Development

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL
- Redis (optional)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Frontend will run on: http://localhost:3000

---

## 🌐 Deployment

### Backend (Railway)

1. Create new project on Railway
2. Add PostgreSQL database
3. Set environment variables:
   - `DATABASE_URL` (auto-set by Railway)
   - `SECRET_KEY`
   - `PORT=8000`
4. Deploy from GitHub repository
5. Set root directory to `backend`

### Frontend (Vercel)

1. Import GitHub repository
2. Set root directory to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api/v1`
4. Deploy

---

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🔑 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/taskdb
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://localhost:6379  # Optional
PORT=8000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 📊 Features Overview

### Dashboard Analytics
- **Pie Chart:** Task status distribution (Completed/Pending/Overdue)
- **Bar Graph:** Tasks by priority level (High/Medium/Low)

### Task Management
- Create tasks with title, description, priority, and due date
- Update task status and details
- Delete tasks (soft delete)
- Restore deleted tasks
- Filter tasks by status, priority, and labels

### Authentication
- Secure JWT-based authentication
- Password hashing with bcrypt
- Token refresh mechanism

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Annu881**
- GitHub: [@Annu881](https://github.com/Annu881)
- Repository: [Task_manager_api](https://github.com/Annu881/Task_manager_api)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI for the high-performance backend framework
- Recharts for beautiful charts
- Shadcn/UI for elegant components
