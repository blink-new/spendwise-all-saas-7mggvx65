import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import blink from '../lib/blink'

interface SaasState {
  loading: boolean
  hasActiveSubscription: boolean
  hasCompletedSetup: boolean
  shouldRedirectTo: '/plans' | '/setup' | '/dashboard' | null
  currentPlan?: {
    plan_id: string
    name: string
    features: any
  }
}

export const useSaasFlow = () => {
  const { user, isLoading: authLoading } = useAuth()
  const [saasState, setSaasState] = useState<SaasState>({
    loading: true,
    hasActiveSubscription: false,
    hasCompletedSetup: false,
    shouldRedirectTo: null
  })

  const checkSaasState = useCallback(async () => {
    if (authLoading || !user) {
      setSaasState(prev => ({ ...prev, loading: authLoading }))
      return
    }

    try {
      // Check for active subscription
      const subscriptions = await blink.db.userSubscriptions.list({
        where: { 
          userId: user.id, 
          status: 'active' 
        },
        orderBy: { createdAt: 'desc' },
        limit: 1
      })

      const hasActiveSubscription = subscriptions.length > 0
      let currentPlan = null

      if (hasActiveSubscription) {
        // Get plan details
        const plans = await blink.db.subscriptionPlans.list({
          where: { planId: subscriptions[0].planId }
        })
        currentPlan = plans[0]
      }

      // Check for completed setup
      const familyProfiles = await blink.db.familyProfiles.list({
        where: { primaryUserId: user.id }
      })

      const hasCompletedSetup = familyProfiles.length > 0

      // Determine redirect logic
      let shouldRedirectTo: '/plans' | '/setup' | '/dashboard' | null = null

      if (!hasActiveSubscription) {
        shouldRedirectTo = '/plans'
      } else if (!hasCompletedSetup) {
        shouldRedirectTo = '/setup'
      } else {
        shouldRedirectTo = '/dashboard'
      }

      setSaasState({
        loading: false,
        hasActiveSubscription,
        hasCompletedSetup,
        shouldRedirectTo,
        currentPlan
      })

    } catch (error) {
      console.error('Error checking SAAS state:', error)
      setSaasState({
        loading: false,
        hasActiveSubscription: false,
        hasCompletedSetup: false,
        shouldRedirectTo: '/plans'
      })
    }
  }, [user, authLoading])

  const refreshSaasState = useCallback(async () => {
    await checkSaasState()
  }, [checkSaasState])

  useEffect(() => {
    checkSaasState()
  }, [checkSaasState])

  return {
    ...saasState,
    refreshSaasState
  }
}