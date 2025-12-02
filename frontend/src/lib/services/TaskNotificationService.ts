import { Task } from '@/types'

class TaskNotificationService {
    private checkInterval: NodeJS.Timeout | null = null
    private notifiedTasks: Set<number> = new Set()

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications')
            return false
        }

        if (Notification.permission === 'granted') {
            return true
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission()
            return permission === 'granted'
        }

        return false
    }

    start(tasks: Task[]) {
        if (this.checkInterval) {
            return
        }

        // Check every minute
        this.checkInterval = setInterval(() => {
            this.checkDueTasks(tasks)
        }, 60000)

        // Initial check
        this.checkDueTasks(tasks)
    }

    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval)
            this.checkInterval = null
        }
    }

    private checkDueTasks(tasks: Task[]) {
        if (Notification.permission !== 'granted') {
            return
        }

        const now = new Date()

        tasks.forEach(task => {
            // Skip if already completed or already notified
            if (task.status === 'completed' || this.notifiedTasks.has(task.id)) {
                return
            }

            // Check if task is due
            if (task.due_date) {
                const dueDate = new Date(task.due_date)

                // If task is overdue (past due time)
                if (dueDate <= now) {
                    this.showNotification(task)
                    this.notifiedTasks.add(task.id)
                }
            }
        })
    }

    private showNotification(task: Task) {
        const notification = new Notification('⏰ Task Due!', {
            body: `"${task.title}" is now overdue!`,
            icon: '/favicon.ico',
            tag: `task-${task.id}`,
            requireInteraction: true
        })

        notification.onclick = () => {
            window.focus()
            notification.close()
        }
    }

    updateTasks(tasks: Task[]) {
        // Remove notifications for completed tasks
        tasks.forEach(task => {
            if (task.status === 'completed') {
                this.notifiedTasks.delete(task.id)
            }
        })
    }
}

export const taskNotificationService = new TaskNotificationService()
