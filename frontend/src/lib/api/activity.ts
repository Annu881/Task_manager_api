
import { apiClient } from './client'
import type { ActivityLog } from '@/types'

export const activityAPI = {
    getActivities: async (): Promise<ActivityLog[]> => {
        const response = await apiClient.get('/activity/')
        return response.data
    },
}
