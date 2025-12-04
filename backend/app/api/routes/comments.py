from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import CommentCreate, CommentResponse
from app.repositories.comment_repo import CommentRepository
from app.repositories.activity_repo import ActivityRepository
from app.repositories.task_repo import TaskRepository
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.get("/task/{task_id}", response_model=List[CommentResponse])
def get_task_comments(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all comments for a specific task"""
    repo = CommentRepository(db)
    return repo.get_by_task(task_id)


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(comment_in: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new comment on a task"""
    repo = CommentRepository(db)
    comment_data = comment_in.model_dump()
    comment_data['user_id'] = current_user.id
    comment = repo.create(comment_data)
    
    # Create activity log
    task_repo = TaskRepository(db)
    task = task_repo.get(comment_in.task_id)
    if task:
        activity_repo = ActivityRepository(db)
        activity_repo.create({
            'action': 'comment_added',
            'description': f'💬 {current_user.username} added a comment on "{task.title}"',
            'task_id': comment_in.task_id,
            'user_id': current_user.id
        })
    
    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a comment (only by the comment author)"""
    repo = CommentRepository(db)
    comment = repo.get(comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment")
    
    repo.delete(comment_id)
    return None
