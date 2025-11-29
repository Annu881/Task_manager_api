

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.task import TaskStatus, TaskPriority


class LabelBase(BaseModel):
    name: str
    color: str = "#6366f1"


class LabelCreate(LabelBase):
    pass


class LabelResponse(LabelBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    task_id: int


class CommentResponse(CommentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    task_id: int
    user_id: int
    created_at: datetime


class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    action: str
    description: Optional[str]
    created_at: datetime
    user_id: int


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    label_ids: Optional[List[int]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    label_ids: Optional[List[int]] = None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_id: int
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    labels: List[LabelResponse] = []
    comments: List[CommentResponse] = []
    activity_logs: List[ActivityLogResponse] = []


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
