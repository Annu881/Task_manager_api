
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.task_repo import TaskRepository
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.label import Label, ActivityLog
from app.schemas.task import TaskCreate, TaskUpdate
import json
import redis
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    if settings.REDIS_URL:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    else:
        redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB, decode_responses=True)
except Exception as e:
    logger.error(f"Failed to initialize Redis client: {e}")
    redis_client = None


class TaskService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TaskRepository(db)

    def _create_activity_log(self, task_id: int, user_id: int, action: str, description: str):
        log = ActivityLog(task_id=task_id, user_id=user_id, action=action, description=description)
        self.db.add(log)
        self.db.commit()

    def _invalidate_cache(self, owner_id: int):
        if not redis_client:
            return
        try:
            pattern = f"tasks:user:{owner_id}:*"
            for key in redis_client.scan_iter(match=pattern):
                redis_client.delete(key)
        except Exception as e:
            logger.error(f"Redis invalidation failed: {e}")

    def create_task(self, task_in: TaskCreate, owner_id: int) -> Task:
        try:
            task_data = task_in.model_dump(exclude={'label_ids'})
            task_data['owner_id'] = owner_id
            task = self.repo.create(task_data)

            if task_in.label_ids:
                labels = self.db.query(Label).filter(Label.id.in_(task_in.label_ids)).all()
                task.labels = labels
                self.db.commit()
                self.db.refresh(task)

            self._create_activity_log(task.id, owner_id, "created", f"Task '{task.title}' created")
            self._invalidate_cache(owner_id)
            return task
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create task: {str(e)}")

    def get_task(self, task_id: int, owner_id: int) -> Optional[Task]:
        task = self.repo.get(task_id)
        if not task or task.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return task

    def get_tasks(self, owner_id: int, search: Optional[str] = None, status: Optional[TaskStatus] = None,
                  priority: Optional[TaskPriority] = None, label_ids: Optional[List[int]] = None,
                  overdue_only: bool = False, page: int = 1, page_size: int = 20,
                  sort_by: str = "created_at", sort_order: str = "desc") -> tuple[List[Task], int]:
        
        cache_key = f"tasks:user:{owner_id}:page:{page}:size:{page_size}:sort:{sort_by}:{sort_order}"
        
        if redis_client and not any([search, status, priority, label_ids, overdue_only]):
            try:
                cached = redis_client.get(cache_key)
                if cached:
                    data = json.loads(cached)
                    # Fetch full task objects from IDs
                    task_ids = data['tasks']
                    # Maintain sort order from cache
                    if not task_ids:
                        return [], data['total']
                    
                    tasks = self.db.query(Task).filter(Task.id.in_(task_ids)).all()
                    # Re-sort in memory because SQL IN clause doesn't guarantee order
                    task_map = {t.id: t for t in tasks}
                    sorted_tasks = [task_map[tid] for tid in task_ids if tid in task_map]
                    return sorted_tasks, data['total']
            except Exception as e:
                logger.error(f"Redis get failed: {e}")

        skip = (page - 1) * page_size
        tasks, total = self.repo.search_tasks(owner_id=owner_id, search=search, status=status, priority=priority,
                                              label_ids=label_ids, overdue_only=overdue_only, skip=skip, limit=page_size,
                                              sort_by=sort_by, sort_order=sort_order)

        if redis_client and not any([search, status, priority, label_ids, overdue_only]):
            try:
                # Store only IDs in cache to avoid serialization issues
                cache_data = {'tasks': [t.id for t in tasks], 'total': total}
                redis_client.setex(cache_key, settings.CACHE_TTL, json.dumps(cache_data))
            except Exception as e:
                logger.error(f"Redis set failed: {e}")

        return tasks, total

    def update_task(self, task_id: int, task_in: TaskUpdate, owner_id: int) -> Task:
        task = self.get_task(task_id, owner_id)
        changes = []
        update_data = task_in.model_dump(exclude_unset=True, exclude={'label_ids'})
        
        for field, new_value in update_data.items():
            old_value = getattr(task, field)
            if old_value != new_value:
                changes.append(f"{field}: {old_value} → {new_value}")
        
        self.repo.update(task, update_data)

        if task_in.label_ids is not None:
            labels = self.db.query(Label).filter(Label.id.in_(task_in.label_ids)).all()
            task.labels = labels
            self.db.commit()

        # Always log updates, even if no changes detected
        log_message = ", ".join(changes) if changes else f"Task '{task.title}' updated"
        self._create_activity_log(task.id, owner_id, "updated", log_message)

        self._invalidate_cache(owner_id)
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int, owner_id: int) -> Task:
        task = self.get_task(task_id, owner_id)
        self.repo.soft_delete(task_id)
        self._create_activity_log(task.id, owner_id, "deleted", f"Task '{task.title}' deleted")
        self._invalidate_cache(owner_id)
        return task

    def restore_task(self, task_id: int, owner_id: int) -> Task:
        task = self.repo.get(task_id)
        if not task or task.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        self.repo.restore(task_id)
        self._create_activity_log(task.id, owner_id, "restored", f"Task '{task.title}' restored")
        self._invalidate_cache(owner_id)
        return task
