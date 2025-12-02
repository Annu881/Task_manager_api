from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base

app = FastAPI(title="Task Management System")

# CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Import routes AFTER creating tables
from app.api.routes import tasks, auth, labels, activity, notifications

app.include_router(auth.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(labels.router, prefix="/api/v1")
app.include_router(activity.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Task Management API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy"}