
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.label import Label
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Session):
        super().__init__(Task, db)

    def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 100, include_deleted: bool = False) -> List[Task]:
        query = self.db.query(Task).filter(Task.owner_id == owner_id)
        if not include_deleted:
            query = query.filter(Task.is_deleted == False)
        return query.offset(skip).limit(limit).all()

    def search_tasks(self, owner_id: int, search: Optional[str] = None, status: Optional[TaskStatus] = None,
                     priority: Optional[TaskPriority] = None, label_ids: Optional[List[int]] = None,
                     overdue_only: bool = False, skip: int = 0, limit: int = 100) -> tuple[List[Task], int]:
        query = self.db.query(Task).filter(and_(Task.owner_id == owner_id, Task.is_deleted == False))

        if search:
            query = query.filter(or_(Task.title.ilike(f"%{search}%"), Task.description.ilike(f"%{search}%")))

        if status:
            query = query.filter(Task.status == status)

        if priority:
            query = query.filter(Task.priority == priority)

        if label_ids:
            query = query.join(Task.labels).filter(Label.id.in_(label_ids))

        if overdue_only:
            query = query.filter(and_(Task.due_date < datetime.utcnow(), Task.status != TaskStatus.COMPLETED))

        total = query.count()
        tasks = query.offset(skip).limit(limit).all()
        return tasks, total

    def soft_delete(self, task_id: int) -> Optional[Task]:
        task = self.get(task_id)
        if task:
            task.is_deleted = True
            task.deleted_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(task)
        return task

    def restore(self, task_id: int) -> Optional[Task]:
        task = self.get(task_id)
        if task and task.is_deleted:
            task.is_deleted = False
            task.deleted_at = None
            self.db.commit()
            self.db.refresh(task)
        return task

    def get_overdue_tasks(self, owner_id: int) -> List[Task]:
        return self.db.query(Task).filter(
            and_(Task.owner_id == owner_id, Task.is_deleted == False,
                 Task.due_date < datetime.utcnow(), Task.status != TaskStatus.COMPLETED)
        ).all()
