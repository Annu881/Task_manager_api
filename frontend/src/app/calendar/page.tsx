'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { taskAPI } from '@/lib/api/tasks'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { useTaskStore } from '@/lib/store/taskStore'
import { TaskPriority } from '@/types'

const priorityColors = {
  [TaskPriority.HIGH]: 'bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-500/30',
  [TaskPriority.MEDIUM]: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 hover:bg-orange-500/30',
  [TaskPriority.LOW]: 'bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30',
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { openTaskModal } = useTaskStore()

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.getTasks({}),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getTasksForDay = (date: Date) => {
    return data?.tasks.filter(task =>
      task.due_date && isSameDay(new Date(task.due_date), date)
    ) || []
  }

  return (
    <div className="min-h-screen ml-20 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2">
              Calendar
            </h1>
            <p className="text-slate-600 dark:text-slate-400">View tasks by date</p>
          </div>

          <button
            onClick={() => openTaskModal()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-slate-600 dark:text-slate-400">Loading calendar...</p>
              </div>
            </div>
          ) : (
            /* Calendar Grid */
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-slate-600 dark:text-slate-400 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map(day => {
                const tasksForDay = getTasksForDay(day)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-24 p-2 rounded-xl border transition-all ${isToday
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {tasksForDay.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1.5 rounded mb-1 truncate cursor-pointer transition-colors font-medium ${priorityColors[task.priority as TaskPriority] || 'bg-purple-500/20 text-purple-700'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            openTaskModal(task)
                          }}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasksForDay.length > 3 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          +{tasksForDay.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}