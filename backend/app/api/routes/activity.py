
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


@router.delete("/{activity_id}", status_code=204)
def delete_activity_log(activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = ActivityRepository(db)
    activity = repo.get(activity_id)
    if not activity:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Activity log not found")
    if activity.user_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to delete this activity log")
    
    repo.delete(activity_id)
    return None
