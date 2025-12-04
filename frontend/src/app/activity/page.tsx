'use client'
import { useQuery } from '@tanstack/react-query'
import { activityAPI } from '@/lib/api/activity'
import { format, formatDistanceToNow } from 'date-fns'
import { Activity, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import toast from 'react-hot-toast'

export default function ActivityPage() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: activityAPI.getActivities,
  })

  const { refetch } = useQuery({
    queryKey: ['activities'],
    queryFn: activityAPI.getActivities,
  })

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('Are you sure you want to delete this activity log?')) return

    try {
      await apiClient.delete(`/activity/${id}`)
      refetch()
      toast.success('Activity log deleted')
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Failed to delete activity log')
    }
  }

  return (
    <div className="min-h-screen ml-20 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-8">
          Activity
        </h1>

        <div className="glass-card p-6 rounded-3xl">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading activities...</div>
          ) : activities?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No activity recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {activities?.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group relative">
                  <button
                    onClick={() => handleDeleteActivity(log.id)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete activity log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-medium">
                      {log.description}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(log.created_at + 'Z'), { addSuffix: true })}
                      {' • '}
                      {format(new Date(log.created_at + 'Z'), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}