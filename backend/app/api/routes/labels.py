
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import LabelCreate, LabelResponse
from app.repositories.label_repo import LabelRepository
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/labels", tags=["Labels"])

@router.get("/", response_model=List[LabelResponse])
def get_labels(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = LabelRepository(db)
    return repo.get_by_owner(current_user.id)

@router.post("/", response_model=LabelResponse, status_code=status.HTTP_201_CREATED)
def create_label(label_in: LabelCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = LabelRepository(db)
    label_data = label_in.model_dump()
    label_data['created_by'] = current_user.id
    return repo.create(label_data)
