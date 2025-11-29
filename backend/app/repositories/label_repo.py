
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.label import Label
from app.repositories.base import BaseRepository

class LabelRepository(BaseRepository[Label]):
    def __init__(self, db: Session):
        super().__init__(Label, db)

    def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 100) -> List[Label]:
        return self.db.query(Label).filter(Label.created_by == owner_id).offset(skip).limit(limit).all()
