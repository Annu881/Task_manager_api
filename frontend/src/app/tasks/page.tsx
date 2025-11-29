'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api/auth'
import { Plus, CheckCircle, Circle, Trash2, Edit, Clock } from 'lucide-react'
import { useTaskStore } from '@/lib/store/taskStore'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { taskAPI } from '@/lib/api/tasks'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  due_date: string | null
  created_at: string
}

export default function TasksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const { openTaskModal } = useTaskStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: tasksData, isLoading: loading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      console.log('Fetching tasks...')
      const result = await taskAPI.getTasks({})
      console.log('Tasks fetched:', result)
      return result
    },
    enabled: mounted,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const response = await fetch(`http://localhost:8000/api/v1/tasks/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      }
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

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    toggleMutation.mutate({ id: task.id, data: { ...task, status: newStatus } })
  }

  const handleLogout = () => {
    authAPI.logout()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="mt-1"
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
                      <p className="text-gray-600 mt-2">{task.description}</p>

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

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}