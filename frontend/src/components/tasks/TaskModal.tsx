'use client'
import { useState, useEffect } from 'react'
import { useTaskStore } from '@/lib/store/taskStore'
import { taskAPI } from '@/lib/api/tasks'
import { TaskPriority, TaskStatus } from '@/types'
import { X, Calendar, Flag, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function TaskModal() {
  const { selectedTask, isTaskModalOpen, closeTaskModal, updateTask, addTask } = useTaskStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(!selectedTask)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    due_date: '',
  })

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title,
        description: selectedTask.description || '',
        priority: selectedTask.priority,
        status: selectedTask.status,
        due_date: selectedTask.due_date
          ? format(new Date(selectedTask.due_date), 'yyyy-MM-dd')
          : '',
      })
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }, [selectedTask])

  const createMutation = useMutation({
    mutationFn: taskAPI.createTask,
    onSuccess: (data) => {
      addTask(data)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      closeTaskModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      taskAPI.updateTask(id, data),
    onSuccess: (data) => {
      updateTask(data.id, data)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsEditing(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // datetime-local gives us "YYYY-MM-DDTHH:MM", we need to add ":00" for seconds
    let due_date = formData.due_date ? `${formData.due_date}:00` : undefined

    const taskData = { ...formData, due_date }
    if (selectedTask) {
      updateMutation.mutate({ id: selectedTask.id, data: taskData })
    } else {
      createMutation.mutate(taskData)
    }
  }

  if (!isTaskModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-up border border-purple-100 dark:border-purple-900">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500 to-blue-500">
          <h2 className="text-2xl font-bold text-white">
            {selectedTask ? '✏️ Task Details' : '✨ Create New Task'}
          </h2>
          <button
            onClick={closeTaskModal}
            className="p-2 rounded-xl hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">📝 Title</label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="Enter task title..."
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">📄 Description</label>
              <textarea
                rows={4}
                disabled={!isEditing}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="Describe your task..."
              />
            </div>

            {/* PRIORITY - STATUS - DUE DATE */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Flag className="w-4 h-4" /> Priority
                </label>
                <select
                  disabled={!isEditing}
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as TaskPriority,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800"
                >
                  <option value={TaskPriority.LOW}>Low</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.HIGH}>High</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" /> Status
                </label>
                <select
                  disabled={!isEditing}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as TaskStatus,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800"
                >
                  <option value={TaskStatus.TODO}>To Do</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.COMPLETED}>Completed</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-purple-500" /> 📅 Due Date & Time
                </label>
                <input
                  type="datetime-local"
                  disabled={!isEditing}
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
            </div>


            {/* ACTIVITY LOG */}
            {selectedTask && selectedTask.activity_logs?.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4" /> Activity Log
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedTask.activity_logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <div className="flex-1">
                        <p>{log.description}</p>
                        <p className="text-xs opacity-60">
                          {format(new Date(log.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {!isEditing && selectedTask && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 rounded-xl bg-purple-500 text-white"
                >
                  Edit Task
                </button>
              )}

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={closeTaskModal}
                    className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                  >
                    {selectedTask ? '✅ Update Task' : '✨ Create Task'}
                  </button>
                </>
              )}
            </div>

          </form>
        </div>
      </div >
    </div >
  )
}
