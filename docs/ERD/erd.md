# 📘 Database Schema (ERD)

This document describes the database schema for the Task Management API built with FastAPI + SQLAlchemy.

---

## 🧑‍💼 User

| Column  | Type | Description |
|--------|------|-------------|
| id     | PK   | Unique user ID |
| name   | str  | User's full name |
| email  | str  | Unique user email |
| password | str (hashed) | Encrypted password |

---

## ✅ Task

| Column      | Type | Description |
|-------------|------|-------------|
| id          | PK   | Unique task ID |
| title       | str  | Task title |
| description | str  | Task details |
| status      | enum(todo/in_progress/done) | Task state |
| created_at  | datetime | Auto timestamp |
| updated_at  | datetime | Auto timestamp |
| user_id     | FK → User.id | Task owner |

---

## 🏷️ Label

| Column | Type | Description |
|--------|------|-------------|
| id     | PK   | Unique label ID |
| name   | str  | Label text |
| color  | str  | UI color code |

---

## 🔗 TaskLabel (many-to-many)

| Column   | Type | Description |
|----------|------|-------------|
| task_id  | FK → Task.id | Linked task |
| label_id | FK → Label.id | Linked label |

---

## 💬 Comment

| Column     | Type | Description |
|------------|------|-------------|
| id         | PK   | Unique comment ID |
| text       | str  | Comment message |
| created_at | datetime | Auto timestamp |
| task_id    | FK → Task.id | Comment belongs to which task |
| user_id    | FK → User.id | Comment written by which user |

---

## 📊 ERD Diagram

The ERD visually represents relationships:

- User 1 → N Task  
- Task N → M Label  
- Task 1 → N Comment  
- User 1 → N Comment  

(Insert `erd.png` here in repo)

---

# ✔ This file is required for documentation, OJT, and GitHub
Place it here:

