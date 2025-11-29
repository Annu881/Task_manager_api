
from typing import List
from sqlalchemy.orm import Session
from app.models.label import ActivityLog
from app.repositories.base import BaseRepository

class ActivityRepository(BaseRepository[ActivityLog]):
    def __init__(self, db: Session):
        super().__init__(ActivityLog, db)

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 50) -> List[ActivityLog]:
        return self.db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
