import { apiClient } from './client'

export interface Comment {
    id: number
    content: string
    task_id: number
    user_id: number
    created_at: string
}

export interface CommentCreate {
    content: string
    task_id: number
}

export const commentAPI = {
    getTaskComments: async (taskId: number): Promise<Comment[]> => {
        const response = await apiClient.get(`/comments/task/${taskId}`)
        return response.data
    },

    createComment: async (data: CommentCreate): Promise<Comment> => {
        const response = await apiClient.post('/comments', data)
        return response.data
    },

    deleteComment: async (commentId: number): Promise<void> => {
        await apiClient.delete(`/comments/${commentId}`)
    },
}
