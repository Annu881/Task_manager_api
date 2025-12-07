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
  sort_by?: string
  sort_order?: string
}

export const taskAPI = {
  getTasks: async (params: GetTasksParams = {}): Promise<TaskListResponse> => {
    const response = await apiClient.get('/tasks/', { params })
    return response.data
  },
  getTask: async (taskId: number): Promise<Task> => {
    const response = await apiClient.get(`/tasks/${taskId}`)
    return response.data
  },
  createTask: async (data: TaskCreateInput): Promise<Task> => {
    const response = await apiClient.post('/tasks/', data)
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
