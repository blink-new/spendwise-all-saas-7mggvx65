import { ReactNode, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSaasFlow } from '../hooks/useSaasFlow'

interface ProtectedRouteProps {
  children: ReactNode
  requiresAuth?: boolean
  requiresSubscription?: boolean
  requiresSetup?: boolean
}

export const ProtectedRoute = ({ 
  children, 
  requiresAuth = true,
  requiresSubscription = false,
  requiresSetup = false
}: ProtectedRouteProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuth()
  const saasState = useSaasFlow()

  useEffect(() => {
    // Wait for auth to load
    if (authLoading || saasState.loading) return

    // Check authentication requirement
    if (requiresAuth && !user) {
      console.log('🔒 Auth required - redirecting to login')
      navigate('/', { replace: true })
      return
    }

    // If user is authenticated, check SAAS flow requirements
    if (user && saasState.shouldRedirectTo) {
      const currentPath = location.pathname

      // Prevent redirect loops
      if (currentPath === saasState.shouldRedirectTo) return

      // Check subscription requirement
      if (requiresSubscription && !saasState.hasActiveSubscription) {
        console.log('💳 Subscription required - redirecting to plans')
        navigate('/plans', { replace: true })
        return
      }

      // Check setup requirement
      if (requiresSetup && !saasState.hasCompletedSetup) {
        console.log('⚙️ Setup required - redirecting to setup')
        navigate('/setup', { replace: true })
        return
      }

      // Auto-redirect based on SAAS state
      if (currentPath === '/' || currentPath === '/auth/callback') {
        console.log(`🚀 Auto-redirecting to ${saasState.shouldRedirectTo}`)
        navigate(saasState.shouldRedirectTo, { replace: true })
        return
      }
    }
  }, [
    authLoading,
    saasState.loading,
    user,
    saasState.shouldRedirectTo,
    saasState.hasActiveSubscription,
    saasState.hasCompletedSetup,
    requiresAuth,
    requiresSubscription,
    requiresSetup,
    navigate,
    location.pathname
  ])

  // Show loading while checking auth/saas state
  if (authLoading || saasState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading SpendWise-All...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if auth required but not authenticated
  if (requiresAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Authentication Required</h2>
          <p className="text-primary-600 mb-6">Please sign in to access SpendWise-All</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}