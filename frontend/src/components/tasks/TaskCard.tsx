'use client'
import { Task, TaskPriority, TaskStatus } from '@/types'
import { Clock, MessageSquare, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useTaskStore } from '@/lib/store/taskStore'

interface TaskCardProps {
  task: Task
}

const priorityStyles = {
  [TaskPriority.HIGH]: 'priority-high',
  [TaskPriority.MEDIUM]: 'priority-medium',
  [TaskPriority.LOW]: 'priority-low',
}

const statusColors = {
  [TaskStatus.TODO]: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  [TaskStatus.COMPLETED]: 'bg-green-500/10 text-green-700 dark:text-green-300',
  [TaskStatus.ARCHIVED]: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
}

export default function TaskCard({ task }: TaskCardProps) {
  const { openTaskModal } = useTaskStore()
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== TaskStatus.COMPLETED

  return (
    <div onClick={() => openTaskModal(task)} className="task-card cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {task.title}
          </h3>
          {task.description && <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{task.description}</p>}
        </div>
        <span className={`label-pill ${priorityStyles[task.priority]} ml-3`}>{task.priority}</span>
      </div>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {task.labels.map((label) => (
            <span key={label.id} className="label-pill text-white" style={{ backgroundColor: label.color }}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          {task.due_date && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 dark:text-red-400' : ''}`}>
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}

          {task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>

        <span className={`label-pill ${statusColors[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      {isOverdue && (
        <div className="mt-3 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
          <Clock className="w-3 h-3" />
          <span>Overdue</span>
        </div>
      )}
    </div>
  )
}