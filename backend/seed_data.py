from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.label import Label
from app.core.security import get_password_hash
from datetime import datetime, timedelta

db = SessionLocal()

print("🌱 Seeding database...")

demo_user = User(
    email="demo@taskmanager.com",
    username="demouser",
    hashed_password=get_password_hash("demo123"),
    full_name="Demo User",
    role=UserRole.USER
)
db.add(demo_user)
db.commit()
db.refresh(demo_user)
print(f"✅ Created user: {demo_user.username}")

labels = [
    Label(name="Work", color="#3b82f6", created_by=demo_user.id),
    Label(name="Personal", color="#10b981", created_by=demo_user.id),
    Label(name="Urgent", color="#ef4444", created_by=demo_user.id),
    Label(name="Design", color="#8b5cf6", created_by=demo_user.id),
    Label(name="Development", color="#f59e0b", created_by=demo_user.id),
]
for label in labels:
    db.add(label)
db.commit()
print(f"✅ Created {len(labels)} labels")

tasks = [
    Task(
        title="Complete project proposal",
        description="Draft and finalize Q1 project proposal with budget estimates",
        status=TaskStatus.IN_PROGRESS,
        priority=TaskPriority.HIGH,
        due_date=datetime.now() + timedelta(days=3),
        owner_id=demo_user.id
    ),
    Task(
        title="Design new landing page",
        description="Create mockups for homepage redesign with modern UI",
        status=TaskStatus.TODO,
        priority=TaskPriority.MEDIUM,
        due_date=datetime.now() + timedelta(days=7),
        owner_id=demo_user.id
    ),
    Task(
        title="Fix authentication bug",
        description="Resolve JWT token refresh issues in production",
        status=TaskStatus.TODO,
        priority=TaskPriority.HIGH,
        due_date=datetime.now() + timedelta(days=1),
        owner_id=demo_user.id
    ),
    Task(
        title="Weekly team meeting notes",
        description="Document action items from team sync meeting",
        status=TaskStatus.COMPLETED,
        priority=TaskPriority.LOW,
        owner_id=demo_user.id
    ),
    Task(
        title="Update documentation",
        description="Add API documentation for new endpoints",
        status=TaskStatus.TODO,
        priority=TaskPriority.MEDIUM,
        due_date=datetime.now() + timedelta(days=5),
        owner_id=demo_user.id
    ),
]

for i, task in enumerate(tasks):
    db.add(task)
    db.commit()
    db.refresh(task)
    
    if i < 3:
        task.labels = [labels[0], labels[2]]
    elif i == 3:
        task.labels = [labels[1]]
    else:
        task.labels = [labels[4]]
    
    db.commit()

print(f"✅ Created {len(tasks)} tasks")

print("\n" + "="*50)
print("✅ SEED DATA CREATED SUCCESSFULLY!")
print("="*50)
print("\n📧 Demo Login Credentials:")
print("   Email:    demo@taskmanager.com")
print("   Username: demouser")
print("   Password: demo123")
print("\n🚀 Start the backend server:")
print("   uvicorn app.main:app --reload")
print("\n📚 API Documentation:")
print("   http://localhost:8000/docs")
print("="*50 + "\n")

db.close()