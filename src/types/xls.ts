export interface BankConfig {
  bankName: string
  bankCode: string
  columns: {
    date: string | number
    description: string | number
    debit?: string | number
    credit?: string | number
    amount?: string | number
    balance?: string | number
    reference?: string | number
  }
  dateFormat: string
  skipRows: number
  sheetName?: string
}

export interface RawTransaction {
  date: string
  description: string
  debit?: number
  credit?: number
  amount?: number
  balance?: number
  reference?: string
  type: 'debit' | 'credit'
}

export interface ProcessedTransaction {
  id: string
  userId: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  balance?: number
  reference?: string
  category?: string
  subcategory?: string
  vendor?: string
  bankName: string
  bankCode: string
  confidence?: number
  isManuallyReviewed: boolean
  createdAt: string
  updatedAt: string
}

export interface XlsProcessingResult {
  success: boolean
  totalTransactions: number
  processedTransactions: number
  failedTransactions: number
  transactions: ProcessedTransaction[]
  errors: string[]
  bankInfo: {
    bankName: string
    bankCode: string
    accountNumber?: string
  }
  processingTime: number
}

export interface XlsProcessingOptions {
  bankConfig?: BankConfig
  autoDetectBank?: boolean
  skipDuplicates?: boolean
  dateRange?: {
    from: string
    to: string
  }
  categoryMapping?: boolean
}

export interface BankDetectionResult {
  bankName: string
  bankCode: string
  confidence: number
  config: BankConfig
}

export interface CategoryMapping {
  id: string
  category: string
  subcategory: string
  keywords: string[]
  priority: number
}

export interface VendorMapping {
  id: string
  vendorName: string
  category: string
  subcategory: string
  keywords: string[]
  confidence: number
}