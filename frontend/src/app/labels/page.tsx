'use client'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { useTaskStore } from '@/lib/store/taskStore'

interface Label {
    id: number
    name: string
    color: string
    created_at: string
}

export default function LabelsPage() {
    const { openTaskModal } = useTaskStore()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newLabel, setNewLabel] = useState({ name: '', color: '#6366f1' })

    const { data: labels, isLoading, refetch } = useQuery({
        queryKey: ['labels'],
        queryFn: async () => {
            const response = await apiClient.get('/labels/')
            return response.data as Label[]
        },
    })

    const handleCreateLabel = async () => {
        try {
            await apiClient.post('/labels/', newLabel)
            setShowCreateModal(false)
            setNewLabel({ name: '', color: '#6366f1' })
            refetch()
        } catch (error) {
            console.error('Error creating label:', error)
        }
    }

    return (
        <div className="min-h-screen ml-20 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        Labels
                    </h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Label
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">Loading labels...</div>
                ) : labels?.length === 0 ? (
                    <div className="glass-card p-12 text-center rounded-3xl">
                        <p className="text-slate-500">No labels yet. Create your first label!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {labels?.map((label) => (
                            <div
                                key={label.id}
                                className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full"
                                        style={{ backgroundColor: label.color }}
                                    />
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {label.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {new Date(label.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Label Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="glass-card p-8 rounded-3xl max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold mb-6">Create New Label</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newLabel.name}
                                        onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800"
                                        placeholder="Enter label name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <input
                                        type="color"
                                        value={newLabel.color}
                                        onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                                        className="w-full h-12 rounded-xl border"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCreateLabel}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 dark:bg-slate-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
