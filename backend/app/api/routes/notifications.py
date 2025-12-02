from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.email_service import email_service
from app.api.routes.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/notifications/check-overdue")
async def check_overdue_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger check for overdue tasks and send email notifications.
    This can be called by a cron job or scheduled task.
    """
    notifications_sent = email_service.check_and_notify_overdue_tasks(db)
    
    return {
        "message": f"Checked overdue tasks. Sent {notifications_sent} notifications.",
        "notifications_sent": notifications_sent
    }
