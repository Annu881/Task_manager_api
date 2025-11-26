# app/schemas.py (add/replace relevant parts)
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[RoleEnum] = RoleEnum.user

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: RoleEnum

    model_config = {"from_attributes": True}

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"

class TaskCreate(TaskBase):
    labels: Optional[List[int]] = []
    priority: Optional[PriorityEnum] = PriorityEnum.medium
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[str]
    labels: Optional[List[int]]
    priority: Optional[PriorityEnum]
    due_date: Optional[datetime]

class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    task_id: int

class LabelCreate(BaseModel):
    name: str
    color: Optional[str] = None

class LabelResponse(LabelCreate):
    id: int
    model_config = {"from_attributes": True}

class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    author: Optional[UserResponse] = None
    model_config = {"from_attributes": True}

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: Optional[UserResponse] = None
    labels: List[LabelResponse] = []
    comments: List[CommentResponse] = []
    priority: PriorityEnum
    due_date: Optional[datetime]
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    task_id: Optional[int]
    action: str
    details: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
