import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import blink from '../lib/blink'

interface UsageMetrics {
  userId: string
  month: string
  statementsUploaded: number
  transactionsProcessed: number
  pdfUploads: number
  xlsUploads: number
  lastUpdated: string
}

interface UsageState {
  loading: boolean
  currentUsage: UsageMetrics | null
  canUpload: boolean
  remainingUploads: number
  error: string | null
}

export const useUsageTracking = (monthlyLimit: number = 3) => {
  const { user } = useAuth()
  const [usageState, setUsageState] = useState<UsageState>({
    loading: true,
    currentUsage: null,
    canUpload: true,
    remainingUploads: monthlyLimit,
    error: null
  })

  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const fetchUsageMetrics = useCallback(async () => {
    if (!user) {
      setUsageState(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      const currentMonth = getCurrentMonth()
      
      // Try to get existing usage record for current month
      const existingUsage = await blink.db.usageMetrics.list({
        where: { 
          userId: user.id,
          month: currentMonth
        },
        limit: 1
      })

      let currentUsage: UsageMetrics

      if (existingUsage.length > 0) {
        currentUsage = existingUsage[0] as UsageMetrics
      } else {
        // Create new usage record for current month
        const newUsage = {
          userId: user.id,
          month: currentMonth,
          statementsUploaded: 0,
          transactionsProcessed: 0,
          pdfUploads: 0,
          xlsUploads: 0,
          lastUpdated: new Date().toISOString()
        }

        const created = await blink.db.usageMetrics.create(newUsage)
        currentUsage = created as UsageMetrics
      }

      const remainingUploads = Math.max(0, monthlyLimit - currentUsage.statementsUploaded)
      const canUpload = remainingUploads > 0

      setUsageState({
        loading: false,
        currentUsage,
        canUpload,
        remainingUploads,
        error: null
      })

    } catch (error) {
      console.error('Error fetching usage metrics:', error)
      setUsageState({
        loading: false,
        currentUsage: null,
        canUpload: false,
        remainingUploads: 0,
        error: 'Failed to load usage data'
      })
    }
  }, [user, monthlyLimit])

  const trackUpload = useCallback(async (fileType: 'pdf' | 'xls', transactionCount: number = 0) => {
    if (!user || !usageState.currentUsage) return

    try {
      const currentMonth = getCurrentMonth()
      const updatedUsage = {
        statementsUploaded: usageState.currentUsage.statementsUploaded + 1,
        transactionsProcessed: usageState.currentUsage.transactionsProcessed + transactionCount,
        pdfUploads: usageState.currentUsage.pdfUploads + (fileType === 'pdf' ? 1 : 0),
        xlsUploads: usageState.currentUsage.xlsUploads + (fileType === 'xls' ? 1 : 0),
        lastUpdated: new Date().toISOString()
      }

      await blink.db.usageMetrics.update(usageState.currentUsage.userId, updatedUsage)
      
      // Refresh usage data
      await fetchUsageMetrics()

    } catch (error) {
      console.error('Error tracking upload:', error)
    }
  }, [user, usageState.currentUsage, fetchUsageMetrics])

  const resetMonthlyUsage = useCallback(async () => {
    if (!user) return

    try {
      const currentMonth = getCurrentMonth()
      const resetUsage = {
        userId: user.id,
        month: currentMonth,
        statementsUploaded: 0,
        transactionsProcessed: 0,
        pdfUploads: 0,
        xlsUploads: 0,
        lastUpdated: new Date().toISOString()
      }

      await blink.db.usageMetrics.create(resetUsage)
      await fetchUsageMetrics()

    } catch (error) {
      console.error('Error resetting usage:', error)
    }
  }, [user, fetchUsageMetrics])

  useEffect(() => {
    fetchUsageMetrics()
  }, [fetchUsageMetrics])

  return {
    ...usageState,
    trackUpload,
    resetMonthlyUsage,
    refreshUsage: fetchUsageMetrics
  }
}