'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api/auth'
import { Plus, CheckCircle, Circle, Trash2, Edit, Clock } from 'lucide-react'
import { useTaskStore } from '@/lib/store/taskStore'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { taskAPI } from '@/lib/api/tasks'
import { Task, TaskStatus, TaskPriority } from '@/types'
import { Search, Filter, ArrowUpDown } from 'lucide-react'

export default function TasksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const { openTaskModal } = useTaskStore()
  const queryClient = useQueryClient()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined)
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 800) // Wait 800ms after user stops typing for smoother experience

    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: tasksData, isLoading: loading, error, isFetching } = useQuery({
    queryKey: ['tasks', search, status, priority, sortBy, sortOrder],
    queryFn: async () => {
      console.log('Fetching tasks with params:', { search, status, priority, sortBy, sortOrder })
      const result = await taskAPI.getTasks({
        search: search || undefined,
        status,
        priority,
        sort_by: sortBy,
        sort_order: sortOrder
      })
      console.log('Tasks fetched:', result)
      return result
    },
    enabled: mounted,
    retry: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  })

  useEffect(() => {
    if (!mounted) return

    const userData = authAPI.getCurrentUser()
    setUser(userData)
  }, [mounted])

  // If query fails with 401, redirect to login
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      authAPI.logout()
      router.push('/auth/login')
    }
  }, [error, router])

  const tasks = tasksData?.tasks || []

  useEffect(() => {
    console.log('Tasks data:', tasksData)
    console.log('Tasks array:', tasks)
    console.log('Tasks length:', tasks.length)
  }, [tasksData, tasks])



  const deleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await taskAPI.deleteTask(id)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => taskAPI.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Click delay mechanism to distinguish single vs double click
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)
  const clickCountRef = useRef(0)

  const handleTaskToggle = (task: Task) => {
    clickCountRef.current += 1

    if (clickCountRef.current === 1) {
      // First click - start timer
      clickTimerRef.current = setTimeout(() => {
        // Single click confirmed - mark as complete
        toggleMutation.mutate({
          id: task.id,
          data: { ...task, status: 'completed' }
        })
        clickCountRef.current = 0
      }, 300)
    } else if (clickCountRef.current === 2) {
      // Second click within timeout - it's a double click
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
      }

      // Double click - mark as incomplete
      toggleMutation.mutate({
        id: task.id,
        data: { ...task, status: 'todo' }
      })
      clickCountRef.current = 0
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">My Tasks</h2>
            <div className="bg-gray-200 h-12 w-32 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-20" />
                      <div className="h-6 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-purple-600 hover:text-purple-700"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-purple-600 hover:text-purple-700"
            >
              Dashboard
            </button>
            <span className="text-gray-700">Welcome, {user?.username}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">My Tasks</h2>
          <button
            onClick={() => openTaskModal()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Task
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {isFetching && searchInput && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              </div>
            )}
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <select
              value={status || ''}
              onChange={(e) => setStatus(e.target.value ? e.target.value as TaskStatus : undefined)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priority || ''}
              onChange={(e) => setPriority(e.target.value ? e.target.value as TaskPriority : undefined)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="flex items-center gap-2 border rounded-lg px-2 bg-gray-50">
              <span className="text-sm text-gray-500 pl-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-2 bg-transparent focus:outline-none text-gray-700 font-medium"
              >
                <option value="created_at">Created Date</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown size={18} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Header */}
        {(search || status || priority) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {search && `Search results for "${search}"`}
                  {status && !search && `Filtered by status: ${status}`}
                  {priority && !search && !status && `Filtered by priority: ${priority}`}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Found {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSearchInput('')
                setSearch('')
                setStatus(undefined)
                setPriority(undefined)
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No tasks yet. Create your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleTaskToggle(task)}
                      className="mt-1"
                      title={task.status === 'completed' ? 'Double-click to mark as incomplete' : 'Click to mark as complete'}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle className="text-green-500" size={24} />
                      ) : (
                        <Circle className="text-gray-400" size={24} />
                      )}
                    </button>

                    <div className="flex-1">
                      <h3
                        className={`text-xl font-semibold ${task.status === 'completed'
                          ? 'line-through text-gray-500'
                          : 'text-gray-800'
                          }`}
                      >
                        {task.title}
                      </h3>
                      <p className="text-gray-600 mt-2">{task.description || ''}</p>

                      <div className="flex items-center gap-4 mt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                            }`}
                        >
                          {task.priority}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${task.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}
                        >
                          {task.status}
                        </span>

                        {task.due_date && (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock size={16} />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openTaskModal(task)}
                      className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}