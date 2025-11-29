'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api/auth'
import { useQuery } from '@tanstack/react-query'
import { taskAPI } from '@/lib/api/tasks'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: tasksData, isLoading: loading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.getTasks({}),
    enabled: mounted,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  useEffect(() => {
    if (!mounted) return

    const userData = authAPI.getCurrentUser()
    setUser(userData)
  }, [mounted])

  const tasks = tasksData?.tasks || []
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === 'completed').length,
    pending: tasks.filter((t: any) => t.status !== 'completed').length
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
            <span className="text-gray-700">Welcome, {user?.username || user?.full_name}!</span>
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Your Dashboard! 🎉
          </h2>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">✅ Account Active!</p>
            <p className="text-green-700 mt-1">Your task management system is ready to use.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* User Info Card */}
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-800">{user?.full_name || 'User'}</h3>
                  <p className="text-gray-600 text-sm">@{user?.username}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>

            {/* Total Tasks Card */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-2">📋 Total Tasks</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-gray-600 text-sm mt-2">All tasks</p>
            </div>

            {/* Completed Tasks Card */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-800 mb-2">✅ Completed</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-gray-600 text-sm mt-2">Tasks completed</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/tasks')}
                className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-left transition-all"
              >
                <span className="text-2xl">➕</span>
                <p className="font-semibold mt-2">Create New Task</p>
                <p className="text-sm opacity-90">Add a new task to your list</p>
              </button>
              <button
                onClick={() => router.push('/tasks')}
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-left transition-all"
              >
                <span className="text-2xl">📊</span>
                <p className="font-semibold mt-2">View All Tasks</p>
                <p className="text-sm opacity-90">See all your tasks and manage them</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}