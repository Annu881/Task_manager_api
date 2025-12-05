'use client'
import { useState, useEffect } from 'react'
import { useTaskStore } from '@/lib/store/taskStore'
import { taskAPI } from '@/lib/api/tasks'
import { TaskPriority, TaskStatus } from '@/types'
import { X, Calendar, Flag, Activity, MessageCircle, Trash2, Send } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { commentAPI, Comment } from '@/lib/api/comments'
import { useQuery } from '@tanstack/react-query'

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
  const [newComment, setNewComment] = useState('')

  // Fetch comments for the selected task
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['comments', selectedTask?.id],
    queryFn: () => commentAPI.getTaskComments(selectedTask!.id),
    enabled: !!selectedTask?.id,
  })

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title,
        description: selectedTask.description || '',
        priority: selectedTask.priority,
        status: selectedTask.status,
        due_date: selectedTask.due_date
          ? format(new Date(selectedTask.due_date), "yyyy-MM-dd'T'HH:mm")
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
      toast.success('✅ Task created successfully!')
      closeTaskModal()
    },
    onError: (error: any) => {
      console.error('Create Task Error:', error)
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to create task'
      toast.error(`❌ ${errorMessage}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      taskAPI.updateTask(id, data),
    onSuccess: (data) => {
      updateTask(data.id, data)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('✅ Task updated successfully!')
      setIsEditing(false)
    },
    onError: (error: any) => {
      console.error('Update Task Error:', error)
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to update task'
      toast.error(`❌ ${errorMessage}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert datetime-local to ISO 8601 format with timezone
    let due_date = formData.due_date ? new Date(formData.due_date).toISOString() : undefined

    const taskData = { ...formData, due_date }
    if (selectedTask) {
      updateMutation.mutate({ id: selectedTask.id, data: taskData })
    } else {
      createMutation.mutate(taskData)
    }
  }

  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; task_id: number }) =>
      commentAPI.createComment(data),
    onSuccess: () => {
      setNewComment('')
      refetchComments()
      toast.success('💬 Comment added!')
    },
    onError: (error: any) => {
      console.error('Add Comment Error:', error)
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to add comment'
      toast.error(`❌ ${errorMessage}`)
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => commentAPI.deleteComment(commentId),
    onSuccess: () => {
      refetchComments()
      toast.success('Comment deleted')
    },
    onError: (error: any) => {
      console.error('Delete Comment Error:', error)
      toast.error('Failed to delete comment')
    },
  })

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return
    addCommentMutation.mutate({
      content: newComment.trim(),
      task_id: selectedTask.id
    })
  }

  const handleDeleteComment = (commentId: number) => {
    if (!confirm('Delete this comment?')) return
    deleteCommentMutation.mutate(commentId)
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

            {/* COMMENTS SECTION */}
            {selectedTask && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold">
                  <MessageCircle className="w-5 h-5 text-blue-500" /> Comments
                </h3>

                {/* Add Comment Form */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newComment.trim()) {
                        handleAddComment()
                      }
                    }}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {addCommentMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment: Comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 group relative"
                      >
                        <div className="flex-1">
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDistanceToNow(new Date(comment.created_at + 'Z'), { addSuffix: true })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          title="Delete comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}


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
                          {formatDistanceToNow(new Date(log.created_at + 'Z'), { addSuffix: true })}
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
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {selectedTask ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      selectedTask ? '✅ Update Task' : '✨ Create Task'
                    )}
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
