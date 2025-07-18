import { useState, useCallback } from 'react'
import { XlsProcessor } from '../lib/xlsProcessor'
import { XlsProcessingResult, XlsProcessingOptions, BankConfig } from '../types/xls'
import { useAuth } from './useAuth'
import blink from '../lib/blink'

interface UseXlsProcessingState {
  isProcessing: boolean
  progress: number
  result: XlsProcessingResult | null
  error: string | null
}

interface UseXlsProcessingReturn extends UseXlsProcessingState {
  processFile: (file: File, options?: XlsProcessingOptions) => Promise<void>
  validateFile: (file: File) => Promise<{ valid: boolean; error?: string }>
  getSupportedBanks: () => BankConfig[]
  saveTransactions: (result: XlsProcessingResult) => Promise<void>
  reset: () => void
}

export const useXlsProcessing = (): UseXlsProcessingReturn => {
  const { user } = useAuth()
  const [state, setState] = useState<UseXlsProcessingState>({
    isProcessing: false,
    progress: 0,
    result: null,
    error: null
  })

  const processor = XlsProcessor.getInstance()

  const processFile = useCallback(async (file: File, options: XlsProcessingOptions = {}) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }))
      return
    }

    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      progress: 0, 
      error: null, 
      result: null 
    }))

    try {
      // Validate file first
      setState(prev => ({ ...prev, progress: 10 }))
      const validation = await processor.validateXlsFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Process the file
      setState(prev => ({ ...prev, progress: 30 }))
      const result = await processor.processXlsFile(file, user.id, {
        autoDetectBank: true,
        skipDuplicates: true,
        categoryMapping: true,
        ...options
      })

      setState(prev => ({ ...prev, progress: 90 }))

      if (!result.success && result.errors.length > 0) {
        throw new Error(result.errors.join('; '))
      }

      setState(prev => ({ 
        ...prev, 
        progress: 100, 
        result,
        isProcessing: false 
      }))

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }))
    }
  }, [user, processor])

  const validateFile = useCallback(async (file: File) => {
    return await processor.validateXlsFile(file)
  }, [processor])

  const getSupportedBanks = useCallback(() => {
    return processor.getSupportedBanks()
  }, [processor])

  const saveTransactions = useCallback(async (result: XlsProcessingResult) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Save transactions to database
      const transactionsToSave = result.transactions.map(transaction => ({
        id: transaction.id,
        user_id: user.id,
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        balance: transaction.balance,
        reference: transaction.reference,
        category: transaction.category,
        subcategory: transaction.subcategory,
        vendor: transaction.vendor,
        bank_name: transaction.bankName,
        bank_code: transaction.bankCode,
        confidence: transaction.confidence,
        is_manually_reviewed: transaction.isManuallyReviewed,
        created_at: transaction.createdAt,
        updated_at: transaction.updatedAt
      }))

      // Use Blink SDK to save transactions
      for (const transaction of transactionsToSave) {
        await blink.db.transactions.create(transaction)
      }

      // Save processing log
      await blink.db.xlsProcessingLogs.create({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        file_name: 'uploaded_file.xlsx', // You might want to pass this as parameter
        bank_name: result.bankInfo.bankName,
        bank_code: result.bankInfo.bankCode,
        total_transactions: result.totalTransactions,
        processed_transactions: result.processedTransactions,
        failed_transactions: result.failedTransactions,
        processing_time: result.processingTime,
        errors: result.errors.join('; '),
        created_at: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error saving transactions:', error)
      throw new Error('Failed to save transactions to database')
    }
  }, [user])

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      result: null,
      error: null
    })
  }, [])

  return {
    ...state,
    processFile,
    validateFile,
    getSupportedBanks,
    saveTransactions,
    reset
  }
}

// Hook for fetching saved transactions
export const useTransactions = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async (filters?: {
    dateFrom?: string
    dateTo?: string
    category?: string
    bankCode?: string
    limit?: number
  }) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const query: any = {
        where: { user_id: user.id },
        orderBy: { date: 'desc' },
        limit: filters?.limit || 100
      }

      // Add filters
      if (filters?.dateFrom || filters?.dateTo) {
        query.where.AND = []
        if (filters.dateFrom) {
          query.where.AND.push({ date: { gte: filters.dateFrom } })
        }
        if (filters.dateTo) {
          query.where.AND.push({ date: { lte: filters.dateTo } })
        }
      }

      if (filters?.category) {
        query.where.category = filters.category
      }

      if (filters?.bankCode) {
        query.where.bank_code = filters.bankCode
      }

      const result = await blink.db.transactions.list(query)
      setTransactions(result)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateTransaction = useCallback(async (id: string, updates: any) => {
    if (!user) return

    try {
      await blink.db.transactions.update(id, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      // Refresh transactions
      await fetchTransactions()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
    }
  }, [user, fetchTransactions])

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return

    try {
      await blink.db.transactions.delete(id)
      
      // Refresh transactions
      await fetchTransactions()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
    }
  }, [user, fetchTransactions])

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    updateTransaction,
    deleteTransaction
  }
}