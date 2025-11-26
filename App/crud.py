"""
CRUD operations for Tasks, Labels, Comments, and Activity Logs.
Super clean, simple, and readable.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, List

from . import models, Schemas


# =====================================================
# COMMON HELPERS
# =====================================================

def utc_now():
    """Return timezone-aware UTC time."""
    return datetime.now(timezone.utc)


def log_activity(db: Session, user_id: Optional[int], task_id: Optional[int], action: str, details: Optional[str] = None):
    """Record create/update/delete/restore actions."""
    entry = models.ActivityLog(
        user_id=user_id,
        task_id=task_id,
        action=action,
        details=details
    )
    db.add(entry)
    db.commit()
    return entry


# =====================================================
# TASK CRUD
# =====================================================

def create_task(db: Session, data: Schemas.TaskCreate, owner_id: Optional[int] = None):
    """Create a new Task."""
    task = models.Task(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority or models.PriorityEnum.medium,
        due_date=data.due_date,
        owner_id=owner_id
    )

    # Attach labels
    if data.labels:
        task.labels = db.query(models.Label).filter(models.Label.id.in_(data.labels)).all()

    db.add(task)
    db.commit()
    db.refresh(task)

    log_activity(db, owner_id, task.id, "create_task", f"title={task.title}")
    return task


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    label: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    owner_id: Optional[int] = None,
    overdue: Optional[bool] = None
):
    """Return tasks with filtering + pagination."""
    query = db.query(models.Task).filter(models.Task.is_deleted == False)

    if owner_id:
        query = query.filter(models.Task.owner_id == owner_id)

    if label:
        query = query.join(models.Task.labels).filter(models.Label.id == label)

    if status:
        query = query.filter(models.Task.status == status)

    if priority:
        query = query.filter(models.Task.priority == models.PriorityEnum(priority))

    if overdue:
        query = query.filter(
            models.Task.due_date != None,
            models.Task.due_date < utc_now()
        )

    return query.offset(skip).limit(limit).all()


def get_task(db: Session, task_id: int):
    """Return a single task (only if not soft-deleted)."""
    return (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.is_deleted == False)
        .first()
    )


def update_task(db: Session, task_id: int, data: Schemas.TaskUpdate, user_id: Optional[int] = None):
    """Update an existing task."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()

    if not task:
        return None

    updates = data.model_dump(exclude_unset=True)

    # Labels (special case)
    if "labels" in updates:
        label_ids = updates.pop("labels") or []
        task.labels = db.query(models.Label).filter(models.Label.id.in_(label_ids)).all()

    # Normal fields
    for field, value in updates.items():
        setattr(task, field, value)

    task.updated_at = utc_now()

    db.commit()
    db.refresh(task)

    log_activity(db, user_id, task.id, "update_task", str(updates))
    return task


def soft_delete_task(db: Session, task_id: int, user_id: Optional[int] = None):
    """Soft-delete (move task to trash)."""
    task = get_task(db, task_id)

    if not task:
        return False

    task.is_deleted = True
    task.deleted_at = utc_now()

    db.commit()
    log_activity(db, user_id, task.id, "delete_task")
    return True


def restore_task(db: Session, task_id: int, user_id: Optional[int] = None):
    """Restore a soft-deleted task."""
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.is_deleted == True)
        .first()
    )

    if not task:
        return False

    task.is_deleted = False
    task.deleted_at = None
    task.updated_at = utc_now()

    db.commit()
    log_activity(db, user_id, task.id, "restore_task")
    return True
