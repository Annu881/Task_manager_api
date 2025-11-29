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
