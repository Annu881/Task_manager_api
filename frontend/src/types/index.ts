export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Label {
  id: number
  name: string
  color: string
  created_at: string
}

export interface Comment {
  id: number
  content: string
  task_id: number
  user_id: number
  created_at: string
}

export interface ActivityLog {
  id: number
  action: string
  description: string
  created_at: string
  user_id: number
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  owner_id: number
  labels: Label[]
  comments: Comment[]
  activity_logs: ActivityLog[]
}

export interface TaskCreateInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
  label_ids?: number[]
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
  label_ids?: number[]
}

export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  role: string
  is_active: boolean
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  page_size: number
  total_pages: number
}