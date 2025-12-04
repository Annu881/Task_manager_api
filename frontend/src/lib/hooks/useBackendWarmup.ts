import { useEffect, useState } from 'react'

export function useBackendWarmup(apiUrl: string) {
    const [isWarming, setIsWarming] = useState(true)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const warmupBackend = async () => {
            try {
                // Enforce HTTPS to prevent mixed content errors
                const secureApiUrl = apiUrl.replace(/^http:\/\//i, 'https://')
                const healthUrl = secureApiUrl.replace('/api/v1', '/health')
                const response = await fetch(healthUrl, {
                    method: 'GET',
                    signal: AbortSignal.timeout(30000), // 30 second timeout
                })

                if (response.ok) {
                    setIsReady(true)
                }
            } catch (error) {
                console.log('Backend warming up...', error)
                // Retry after 2 seconds
                setTimeout(() => warmupBackend(), 2000)
            } finally {
                setIsWarming(false)
            }
        }

        warmupBackend()
    }, [apiUrl])

    return { isWarming, isReady }
}
