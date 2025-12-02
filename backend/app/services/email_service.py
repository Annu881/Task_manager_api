from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from app.models.task import Task
from app.models.user import User
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailNotificationService:
    """Service for sending email notifications for overdue tasks"""
    
    def __init__(self):
        self.smtp_server = getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_username = getattr(settings, 'SMTP_USERNAME', None)
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', None)
        self.from_email = getattr(settings, 'FROM_EMAIL', self.smtp_username)
    
    def send_overdue_task_notification(self, user_email: str, task_title: str, due_date: datetime):
        """Send email notification for an overdue task"""
        if not self.smtp_username or not self.smtp_password:
            logger.warning("SMTP credentials not configured. Email notification skipped.")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'⏰ Task Overdue: {task_title}'
            msg['From'] = self.from_email
            msg['To'] = user_email
            
            # Create HTML content
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 30px; border-radius: 10px;">
                  <h2 style="color: #ef4444;">⏰ Task Overdue Alert</h2>
                  <p style="font-size: 16px; color: #374151;">
                    Your task <strong>"{task_title}"</strong> was due on <strong>{due_date.strftime('%B %d, %Y at %I:%M %p')}</strong> 
                    and has not been completed yet.
                  </p>
                  <div style="margin: 30px 0; padding: 20px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 5px;">
                    <p style="margin: 0; color: #991b1b; font-weight: bold;">
                      Please complete this task as soon as possible!
                    </p>
                  </div>
                  <p style="font-size: 14px; color: #6b7280;">
                    Log in to your Task Management System to update the task status.
                  </p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                  <p style="font-size: 12px; color: #9ca3af;">
                    This is an automated notification from your Task Management System.
                  </p>
                </div>
              </body>
            </html>
            """
            
            # Attach HTML content
            html_part = MIMEText(html, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Overdue task notification sent to {user_email} for task: {task_title}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email notification: {str(e)}")
            return False
    
    def check_and_notify_overdue_tasks(self, db: Session):
        """Check for overdue tasks and send notifications"""
        now = datetime.utcnow()
        
        # Find all overdue tasks that are not completed
        overdue_tasks = db.query(Task).filter(
            Task.due_date <= now,
            Task.status != 'completed',
            Task.is_deleted == False
        ).all()
        
        notifications_sent = 0
        for task in overdue_tasks:
            # Get task owner
            user = db.query(User).filter(User.id == task.user_id).first()
            if user and user.email:
                success = self.send_overdue_task_notification(
                    user_email=user.email,
                    task_title=task.title,
                    due_date=task.due_date
                )
                if success:
                    notifications_sent += 1
        
        logger.info(f"Sent {notifications_sent} overdue task notifications")
        return notifications_sent

email_service = EmailNotificationService()
