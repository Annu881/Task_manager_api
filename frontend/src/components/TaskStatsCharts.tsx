'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Task } from '@/types'

interface TaskStatsChartsProps {
    tasks: Task[]
}

const COLORS = {
    completed: '#10b981', // green
    pending: '#3b82f6',   // blue
    overdue: '#ef4444'    // red
}

const PRIORITY_COLORS = {
    high: '#ef4444',      // red
    medium: '#f59e0b',    // orange
    low: '#10b981'        // green
}

export default function TaskStatsCharts({ tasks }: TaskStatsChartsProps) {
    // Calculate status distribution
    const statusData = useMemo(() => {
        const now = new Date()
        const completed = tasks.filter(t => t.status === 'completed').length
        const overdue = tasks.filter(t =>
            t.status !== 'completed' &&
            t.due_date &&
            new Date(t.due_date) < now
        ).length
        const pending = tasks.length - completed - overdue

        return [
            { name: 'Completed', value: completed, color: COLORS.completed },
            { name: 'Pending', value: pending, color: COLORS.pending },
            { name: 'Overdue', value: overdue, color: COLORS.overdue }
        ].filter(item => item.value > 0)
    }, [tasks])

    // Calculate priority distribution
    const priorityData = useMemo(() => {
        const high = tasks.filter(t => t.priority === 'high').length
        const medium = tasks.filter(t => t.priority === 'medium').length
        const low = tasks.filter(t => t.priority === 'low').length

        return [
            { name: 'High', value: high, color: PRIORITY_COLORS.high },
            { name: 'Medium', value: medium, color: PRIORITY_COLORS.medium },
            { name: 'Low', value: low, color: PRIORITY_COLORS.low }
        ]
    }, [tasks])

    if (tasks.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No tasks yet. Create some tasks to see analytics!</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Task Status */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-center gap-4 text-sm">
                    {statusData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-600">{item.name}: {item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bar Chart - Priority Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Tasks">
                            {priorityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
