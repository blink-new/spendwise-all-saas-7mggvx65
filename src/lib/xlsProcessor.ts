import * as XLSX from 'xlsx'
import { 
  BankConfig, 
  RawTransaction, 
  ProcessedTransaction, 
  XlsProcessingResult, 
  XlsProcessingOptions,
  BankDetectionResult 
} from '../types/xls'
import { detectBankFromHeaders, INDIAN_BANK_CONFIGS } from './bankConfigs'
import { categorizeTransaction } from './transactionCategorizer'

export class XlsProcessor {
  private static instance: XlsProcessor
  
  public static getInstance(): XlsProcessor {
    if (!XlsProcessor.instance) {
      XlsProcessor.instance = new XlsProcessor()
    }
    return XlsProcessor.instance
  }

  async processXlsFile(
    file: File, 
    userId: string, 
    options: XlsProcessingOptions = {}
  ): Promise<XlsProcessingResult> {
    const startTime = Date.now()
    
    try {
      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // Get the first sheet or specified sheet
      const sheetName = options.bankConfig?.sheetName || workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found in the Excel file`)
      }
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
      
      if (jsonData.length === 0) {
        throw new Error('Excel file is empty')
      }
      
      // Detect bank configuration if not provided
      let bankConfig = options.bankConfig
      if (!bankConfig && options.autoDetectBank !== false) {
        const detectionResult = this.detectBank(jsonData)
        if (detectionResult) {
          bankConfig = detectionResult.config
        }
      }
      
      if (!bankConfig) {
        throw new Error('Unable to detect bank format. Please specify bank configuration.')
      }
      
      // Process transactions
      const result = await this.processTransactions(
        jsonData, 
        bankConfig, 
        userId, 
        options
      )
      
      const processingTime = Date.now() - startTime
      
      return {
        ...result,
        bankInfo: {
          bankName: bankConfig.bankName,
          bankCode: bankConfig.bankCode
        },
        processingTime
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime
      return {
        success: false,
        totalTransactions: 0,
        processedTransactions: 0,
        failedTransactions: 0,
        transactions: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        bankInfo: {
          bankName: 'Unknown',
          bankCode: 'UNKNOWN'
        },
        processingTime
      }
    }
  }

  private detectBank(data: any[][]): BankDetectionResult | null {
    if (data.length === 0) return null
    
    // Get headers (usually first row)
    const headers = data[0]?.map(h => String(h || '').toLowerCase()) || []
    
    const detectedConfig = detectBankFromHeaders(headers)
    if (detectedConfig) {
      return {
        bankName: detectedConfig.bankName,
        bankCode: detectedConfig.bankCode,
        confidence: 0.9,
        config: detectedConfig
      }
    }
    
    return null
  }

  private async processTransactions(
    data: any[][],
    bankConfig: BankConfig,
    userId: string,
    options: XlsProcessingOptions
  ): Promise<Omit<XlsProcessingResult, 'bankInfo' | 'processingTime'>> {
    const errors: string[] = []
    const processedTransactions: ProcessedTransaction[] = []
    let failedCount = 0
    
    // Get headers
    const headers = data[0] || []
    const headerMap = this.createHeaderMap(headers, bankConfig)
    
    // Skip header rows
    const dataRows = data.slice(bankConfig.skipRows + 1)
    
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i]
        if (!row || row.length === 0) continue
        
        const rawTransaction = this.parseRow(row, headerMap, bankConfig)
        if (!rawTransaction) continue
        
        // Apply date range filter if specified
        if (options.dateRange) {
          const transactionDate = new Date(rawTransaction.date)
          const fromDate = new Date(options.dateRange.from)
          const toDate = new Date(options.dateRange.to)
          
          if (transactionDate < fromDate || transactionDate > toDate) {
            continue
          }
        }
        
        // Convert to processed transaction
        const processedTransaction = await this.convertToProcessedTransaction(
          rawTransaction,
          bankConfig,
          userId,
          options
        )
        
        processedTransactions.push(processedTransaction)
        
      } catch (error) {
        failedCount++
        errors.push(`Row ${i + bankConfig.skipRows + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return {
      success: errors.length === 0 || processedTransactions.length > 0,
      totalTransactions: dataRows.length,
      processedTransactions: processedTransactions.length,
      failedTransactions: failedCount,
      transactions: processedTransactions,
      errors
    }
  }

  private createHeaderMap(headers: any[], bankConfig: BankConfig): Record<string, number> {
    const headerMap: Record<string, number> = {}
    
    Object.entries(bankConfig.columns).forEach(([key, columnName]) => {
      if (typeof columnName === 'string') {
        const index = headers.findIndex(h => 
          String(h || '').toLowerCase().includes(columnName.toLowerCase())
        )
        if (index !== -1) {
          headerMap[key] = index
        }
      } else if (typeof columnName === 'number') {
        headerMap[key] = columnName
      }
    })
    
    return headerMap
  }

  private parseRow(row: any[], headerMap: Record<string, number>, bankConfig: BankConfig): RawTransaction | null {
    try {
      const getColumnValue = (key: string): string => {
        const index = headerMap[key]
        return index !== undefined ? String(row[index] || '').trim() : ''
      }
      
      const dateStr = getColumnValue('date')
      const description = getColumnValue('description')
      const debitStr = getColumnValue('debit')
      const creditStr = getColumnValue('credit')
      const amountStr = getColumnValue('amount')
      const balanceStr = getColumnValue('balance')
      const reference = getColumnValue('reference')
      
      if (!dateStr || !description) {
        return null
      }
      
      // Parse amounts
      const debit = this.parseAmount(debitStr)
      const credit = this.parseAmount(creditStr)
      const amount = this.parseAmount(amountStr)
      const balance = this.parseAmount(balanceStr)
      
      // Determine transaction type and amount
      let finalAmount: number
      let transactionType: 'debit' | 'credit'
      
      if (amount !== null) {
        finalAmount = Math.abs(amount)
        transactionType = amount < 0 ? 'debit' : 'credit'
      } else if (debit !== null && debit > 0) {
        finalAmount = debit
        transactionType = 'debit'
      } else if (credit !== null && credit > 0) {
        finalAmount = credit
        transactionType = 'credit'
      } else {
        return null // Skip if no valid amount found
      }
      
      return {
        date: this.parseDate(dateStr, bankConfig.dateFormat),
        description,
        debit: debit || undefined,
        credit: credit || undefined,
        amount: finalAmount,
        balance: balance || undefined,
        reference: reference || undefined,
        type: transactionType
      }
      
    } catch (error) {
      console.error('Error parsing row:', error)
      return null
    }
  }

  private parseAmount(amountStr: string): number | null {
    if (!amountStr) return null
    
    // Remove currency symbols, commas, and spaces
    const cleanAmount = amountStr
      .replace(/[₹$,\s]/g, '')
      .replace(/[()]/g, '') // Remove parentheses
      .trim()
    
    if (!cleanAmount || cleanAmount === '-') return null
    
    const amount = parseFloat(cleanAmount)
    return isNaN(amount) ? null : amount
  }

  private parseDate(dateStr: string, format: string): string {
    try {
      // Handle different date formats
      let date: Date
      
      if (format.includes('DD MMM YYYY')) {
        // e.g., "15 Jan 2024"
        date = new Date(dateStr)
      } else if (format.includes('DD/MM/YY')) {
        // e.g., "15/01/24"
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const day = parseInt(parts[0])
          const month = parseInt(parts[1]) - 1
          let year = parseInt(parts[2])
          if (year < 100) year += 2000
          date = new Date(year, month, day)
        } else {
          date = new Date(dateStr)
        }
      } else if (format.includes('DD-MM-YYYY')) {
        // e.g., "15-01-2024"
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          const day = parseInt(parts[0])
          const month = parseInt(parts[1]) - 1
          const year = parseInt(parts[2])
          date = new Date(year, month, day)
        } else {
          date = new Date(dateStr)
        }
      } else {
        date = new Date(dateStr)
      }
      
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`)
      }
      
      return date.toISOString().split('T')[0] // Return YYYY-MM-DD format
      
    } catch (error) {
      throw new Error(`Failed to parse date "${dateStr}" with format "${format}"`)
    }
  }

  private async convertToProcessedTransaction(
    raw: RawTransaction,
    bankConfig: BankConfig,
    userId: string,
    options: XlsProcessingOptions
  ): Promise<ProcessedTransaction> {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    // Categorize transaction if enabled
    let category: string | undefined
    let subcategory: string | undefined
    let vendor: string | undefined
    let confidence: number | undefined
    
    if (options.categoryMapping !== false) {
      const categorization = await categorizeTransaction(raw.description, raw.amount, raw.type)
      category = categorization.category
      subcategory = categorization.subcategory
      vendor = categorization.vendor
      confidence = categorization.confidence
    }
    
    return {
      id,
      userId,
      date: raw.date,
      description: raw.description,
      amount: raw.amount,
      type: raw.type,
      balance: raw.balance,
      reference: raw.reference,
      category,
      subcategory,
      vendor,
      bankName: bankConfig.bankName,
      bankCode: bankConfig.bankCode,
      confidence,
      isManuallyReviewed: false,
      createdAt: now,
      updatedAt: now
    }
  }

  // Utility method to get supported banks
  getSupportedBanks(): BankConfig[] {
    return Object.values(INDIAN_BANK_CONFIGS)
  }

  // Utility method to validate XLS file
  async validateXlsFile(file: File): Promise<{ valid: boolean; error?: string }> {
    try {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        return { valid: false, error: 'File must be an Excel file (.xlsx or .xls)' }
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return { valid: false, error: 'File size must be less than 10MB' }
      }
      
      // Try to read the file
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      if (workbook.SheetNames.length === 0) {
        return { valid: false, error: 'Excel file contains no sheets' }
      }
      
      return { valid: true }
      
    } catch (error) {
      return { 
        valid: false, 
        error: `Invalid Excel file: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }
}