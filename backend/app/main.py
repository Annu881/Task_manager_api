from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base
import subprocess
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Task Management System")

@app.on_event("startup")
async def run_migrations():
    """Run alembic migrations on startup"""
    try:
        logger.info("Running database migrations...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            check=True
        )
        logger.info(f"Migrations completed successfully: {result.stdout}")
    except subprocess.CalledProcessError as e:
        logger.error(f"Migration failed: {e.stderr}")
        # Don't raise - let app start anyway, tables might already exist
    except Exception as e:
        logger.error(f"Unexpected error during migration: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "detail": str(exc),
            "traceback": traceback.format_exc()
        },
    )

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

@app.get("/version")
def version():
    return {"version": "1.1.0", "deployed_at": "2025-12-04_00:15_FIXED_BCRYPT"}