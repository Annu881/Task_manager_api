
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import ActivityLogResponse
from app.repositories.activity_repo import ActivityRepository
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/activity", tags=["Activity"])

@router.get("/", response_model=List[ActivityLogResponse])
def get_activity_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = ActivityRepository(db)
    return repo.get_by_user(current_user.id)
