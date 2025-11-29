#!/bin/bash
# Run this script from the frontend/ directory
# chmod +x setup_frontend.sh && ./setup_frontend.sh

echo "🎨 Setting up frontend files..."

# FILE 10: src/lib/api/client.ts
mkdir -p src/lib/api
cat > src/lib/api/client.ts << 'ENDFILE'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
        const { access_token, refresh_token } = response.data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)
ENDFILE

# FILE 11: src/lib/api/tasks.ts
cat > src/lib/api/tasks.ts << 'ENDFILE'
import { apiClient } from './client'
import type { Task, TaskCreateInput, TaskUpdateInput, TaskListResponse, TaskStatus, TaskPriority } from '@/types'

interface GetTasksParams {
  search?: string
  status?: TaskStatus
  priority?: TaskPriority
  label_ids?: string
  overdue?: boolean
  page?: number
  page_size?: number
}

export const taskAPI = {
  getTasks: async (params: GetTasksParams = {}): Promise<TaskListResponse> => {
    const response = await apiClient.get('/tasks', { params })
    return response.data
  },
  getTask: async (taskId: number): Promise<Task> => {
    const response = await apiClient.get(`/tasks/${taskId}`)
    return response.data
  },
  createTask: async (data: TaskCreateInput): Promise<Task> => {
    const response = await apiClient.post('/tasks', data)
    return response.data
  },
  updateTask: async (taskId: number, data: TaskUpdateInput): Promise<Task> => {
    const response = await apiClient.put(`/tasks/${taskId}`, data)
    return response.data
  },
  deleteTask: async (taskId: number): Promise<Task> => {
    const response = await apiClient.delete(`/tasks/${taskId}`)
    return response.data
  },
  restoreTask: async (taskId: number): Promise<Task> => {
    const response = await apiClient.post(`/tasks/${taskId}/restore`)
    return response.data
  },
}
ENDFILE

# FILE 12: src/lib/store/taskStore.ts
mkdir -p src/lib/store
cat > src/lib/store/taskStore.ts << 'ENDFILE'
import { create } from 'zustand'
import type { Task, TaskStatus, TaskPriority } from '@/types'

interface TaskFilters {
  search: string
  status?: TaskStatus
  priority?: TaskPriority
  labelIds: number[]
  overdueOnly: boolean
}

interface TaskStore {
  tasks: Task[]
  selectedTask: Task | null
  filters: TaskFilters
  isTaskModalOpen: boolean
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: number, updates: Partial<Task>) => void
  removeTask: (taskId: number) => void
  setSelectedTask: (task: Task | null) => void
  openTaskModal: (task?: Task) => void
  closeTaskModal: () => void
  setFilters: (filters: Partial<TaskFilters>) => void
  resetFilters: () => void
}

const initialFilters: TaskFilters = {
  search: '',
  status: undefined,
  priority: undefined,
  labelIds: [],
  overdueOnly: false,
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  selectedTask: null,
  filters: initialFilters,
  isTaskModalOpen: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((task) => task.id === taskId ? { ...task, ...updates } : task),
    selectedTask: state.selectedTask?.id === taskId ? { ...state.selectedTask, ...updates } : state.selectedTask,
  })),
  removeTask: (taskId) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== taskId) })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  openTaskModal: (task) => set({ selectedTask: task || null, isTaskModalOpen: true }),
  closeTaskModal: () => set({ isTaskModalOpen: false, selectedTask: null }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: initialFilters }),
}))
ENDFILE

echo "✅ Created API and store files"
echo "📦 Next: Creating React components..."
