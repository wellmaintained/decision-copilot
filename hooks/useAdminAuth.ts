import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminAuthState {
  isLoading: boolean
  isAdmin: boolean
  error?: string
}

export function useAdminAuth() {
  const router = useRouter()
  const [state, setState] = useState<AdminAuthState>({
    isLoading: true,
    isAdmin: false,
  })

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const response = await fetch('/api/admin/settings/auth')
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
          } else if (response.status === 403) {
            router.push('/unauthorized')
          }
          throw new Error('Admin authentication failed')
        }

        setState({ isLoading: false, isAdmin: true })
      } catch (error) {
        setState({ 
          isLoading: false, 
          isAdmin: false, 
          error: error instanceof Error ? error.message : 'Authentication failed' 
        })
      }
    }

    checkAdminAuth()
  }, [router])

  return state
} 