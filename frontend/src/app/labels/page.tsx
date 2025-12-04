'use client'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { useTaskStore } from '@/lib/store/taskStore'
import toast from 'react-hot-toast'

interface Label {
    id: number
    name: string
    color: string
    created_at: string
}

export default function LabelsPage() {
    const { openTaskModal } = useTaskStore()

    const [showModal, setShowModal] = useState(false)
    const [editingLabel, setEditingLabel] = useState<Label | null>(null)
    const [formData, setFormData] = useState({ name: '', color: '#6366f1' })

    const { data: labels, isLoading, refetch } = useQuery({
        queryKey: ['labels'],
        queryFn: async () => {
            const response = await apiClient.get('/labels/')
            return response.data as Label[]
        },
    })

    const handleSubmit = async () => {
        try {
            if (editingLabel) {
                await apiClient.put(`/labels/${editingLabel.id}`, formData)
                toast.success('Label updated successfully')
            } else {
                await apiClient.post('/labels/', formData)
                toast.success('Label created successfully')
            }
            setShowModal(false)
            setFormData({ name: '', color: '#6366f1' })
            setEditingLabel(null)
            refetch()
        } catch (error) {
            console.error('Error saving label:', error)
            toast.error(editingLabel ? 'Failed to update label' : 'Failed to create label')
        }
    }

    const openCreateModal = () => {
        setEditingLabel(null)
        setFormData({ name: '', color: '#6366f1' })
        setShowModal(true)
    }

    const openEditModal = (label: Label) => {
        setEditingLabel(label)
        setFormData({ name: label.name, color: label.color })
        setShowModal(true)
    }

    const handleDeleteLabel = async (id: number) => {
        if (!confirm('Are you sure you want to delete this label?')) return

        try {
            await apiClient.delete(`/labels/${id}`)
            refetch()
            toast.success('Label deleted successfully')
        } catch (error) {
            console.error('Error deleting label:', error)
            toast.error('Failed to delete label')
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
                        onClick={openCreateModal}
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
                                className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all group relative"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            openEditModal(label)
                                        }}
                                        className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        title="Edit label"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteLabel(label.id)
                                        }}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Delete label"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
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

                {/* Create/Edit Label Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="glass-card p-8 rounded-3xl max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold mb-6">
                                {editingLabel ? 'Edit Label' : 'Create New Label'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800"
                                        placeholder="Enter label name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full h-12 rounded-xl border"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                                >
                                    {editingLabel ? 'Update' : 'Create'}
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
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
