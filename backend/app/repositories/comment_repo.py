from sqlalchemy.orm import Session
from typing import List
from app.models.label import Comment
from app.repositories.base import BaseRepository


class CommentRepository(BaseRepository[Comment]):
    def __init__(self, db: Session):
        super().__init__(Comment, db)
    
    def get_by_task(self, task_id: int) -> List[Comment]:
        return self.db.query(Comment).filter(Comment.task_id == task_id).order_by(Comment.created_at.desc()).all()
    
    def get_by_user(self, user_id: int) -> List[Comment]:
        return self.db.query(Comment).filter(Comment.user_id == user_id).order_by(Comment.created_at.desc()).all()
