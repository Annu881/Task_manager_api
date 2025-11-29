from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.session import get_db
from app.models.user import User
from app.models.task import TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.services.task_service import TaskService
from app.api.routes.auth import get_current_user
import math

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.create_task(task_in, current_user.id)


@router.get("/", response_model=TaskListResponse)
def get_tasks(
    search: Optional[str] = Query(None, description="Search in title and description"),
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    label_ids: Optional[str] = Query(None, description="Comma-separated label IDs"),
    overdue: bool = Query(False, description="Show only overdue tasks"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = TaskService(db)
    label_id_list = None
    if label_ids:
        label_id_list = [int(x) for x in label_ids.split(",")]
    
    tasks, total = service.get_tasks(
        owner_id=current_user.id, search=search, status=status, priority=priority,
        label_ids=label_id_list, overdue_only=overdue, page=page, page_size=page_size
    )
    
    total_pages = math.ceil(total / page_size)
    return TaskListResponse(tasks=tasks, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.get_task(task_id, current_user.id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.update_task(task_id, task_in, current_user.id)


@router.delete("/{task_id}", response_model=TaskResponse)
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.delete_task(task_id, current_user.id)


@router.post("/{task_id}/restore", response_model=TaskResponse)
def restore_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = TaskService(db)
    return service.restore_task(task_id, current_user.id)