import { BankConfig } from '../types/xls'

export const INDIAN_BANK_CONFIGS: Record<string, BankConfig> = {
  SBI: {
    bankName: 'State Bank of India',
    bankCode: 'SBI',
    columns: {
      date: 'Txn Date',
      description: 'Description',
      debit: 'Debit',
      credit: 'Credit',
      balance: 'Balance',
      reference: 'Ref No./Cheque No.'
    },
    dateFormat: 'DD MMM YYYY',
    skipRows: 1,
    sheetName: 'Sheet1'
  },
  HDFC: {
    bankName: 'HDFC Bank',
    bankCode: 'HDFC',
    columns: {
      date: 'Date',
      description: 'Narration',
      debit: 'Debit Amount',
      credit: 'Credit Amount',
      balance: 'Balance',
      reference: 'Chq/Ref Number'
    },
    dateFormat: 'DD/MM/YY',
    skipRows: 1
  },
  ICICI: {
    bankName: 'ICICI Bank',
    bankCode: 'ICICI',
    columns: {
      date: 'Transaction Date',
      description: 'Transaction Remarks',
      debit: 'Withdrawal Amount (INR )',
      credit: 'Deposit Amount (INR )',
      balance: 'Balance (INR )',
      reference: 'Reference Number'
    },
    dateFormat: 'DD-MM-YYYY',
    skipRows: 1
  },
  AXIS: {
    bankName: 'Axis Bank',
    bankCode: 'AXIS',
    columns: {
      date: 'Transaction Date',
      description: 'Description',
      debit: 'Debit',
      credit: 'Credit',
      balance: 'Balance',
      reference: 'Reference Number'
    },
    dateFormat: 'DD-MM-YYYY',
    skipRows: 1
  },
  KOTAK: {
    bankName: 'Kotak Mahindra Bank',
    bankCode: 'KOTAK',
    columns: {
      date: 'Date',
      description: 'Description',
      debit: 'Debit Amount',
      credit: 'Credit Amount',
      balance: 'Balance',
      reference: 'Instrument Number'
    },
    dateFormat: 'DD/MM/YYYY',
    skipRows: 1
  },
  PNB: {
    bankName: 'Punjab National Bank',
    bankCode: 'PNB',
    columns: {
      date: 'Date',
      description: 'Description',
      debit: 'Debit',
      credit: 'Credit',
      balance: 'Balance',
      reference: 'Cheque Number'
    },
    dateFormat: 'DD-MM-YYYY',
    skipRows: 1
  },
  BOI: {
    bankName: 'Bank of India',
    bankCode: 'BOI',
    columns: {
      date: 'Transaction Date',
      description: 'Transaction Particulars',
      debit: 'Debit Amount',
      credit: 'Credit Amount',
      balance: 'Available Balance',
      reference: 'Reference Number'
    },
    dateFormat: 'DD/MM/YYYY',
    skipRows: 1
  },
  CANARA: {
    bankName: 'Canara Bank',
    bankCode: 'CANARA',
    columns: {
      date: 'Date',
      description: 'Particulars',
      debit: 'Debit',
      credit: 'Credit',
      balance: 'Balance',
      reference: 'Ref Number'
    },
    dateFormat: 'DD/MM/YYYY',
    skipRows: 1
  },
  UNION: {
    bankName: 'Union Bank of India',
    bankCode: 'UNION',
    columns: {
      date: 'Date',
      description: 'Transaction Details',
      debit: 'Debit Amount',
      credit: 'Credit Amount',
      balance: 'Balance Amount',
      reference: 'Reference No'
    },
    dateFormat: 'DD-MM-YYYY',
    skipRows: 1
  },
  IDBI: {
    bankName: 'IDBI Bank',
    bankCode: 'IDBI',
    columns: {
      date: 'Transaction Date',
      description: 'Description',
      debit: 'Debit Amount',
      credit: 'Credit Amount',
      balance: 'Balance',
      reference: 'Reference Number'
    },
    dateFormat: 'DD/MM/YYYY',
    skipRows: 1
  }
}

export const detectBankFromHeaders = (headers: string[]): BankConfig | null => {
  const headerStr = headers.join(' ').toLowerCase()
  
  // SBI detection
  if (headerStr.includes('txn date') && headerStr.includes('ref no./cheque no.')) {
    return INDIAN_BANK_CONFIGS.SBI
  }
  
  // HDFC detection
  if (headerStr.includes('narration') && headerStr.includes('chq/ref number')) {
    return INDIAN_BANK_CONFIGS.HDFC
  }
  
  // ICICI detection
  if (headerStr.includes('transaction remarks') && headerStr.includes('withdrawal amount')) {
    return INDIAN_BANK_CONFIGS.ICICI
  }
  
  // Axis detection
  if (headerStr.includes('transaction date') && headerStr.includes('axis')) {
    return INDIAN_BANK_CONFIGS.AXIS
  }
  
  // Kotak detection
  if (headerStr.includes('instrument number') && headerStr.includes('kotak')) {
    return INDIAN_BANK_CONFIGS.KOTAK
  }
  
  // PNB detection
  if (headerStr.includes('cheque number') && headerStr.includes('punjab')) {
    return INDIAN_BANK_CONFIGS.PNB
  }
  
  // BOI detection
  if (headerStr.includes('transaction particulars') && headerStr.includes('available balance')) {
    return INDIAN_BANK_CONFIGS.BOI
  }
  
  // Canara detection
  if (headerStr.includes('particulars') && headerStr.includes('canara')) {
    return INDIAN_BANK_CONFIGS.CANARA
  }
  
  // Union detection
  if (headerStr.includes('transaction details') && headerStr.includes('union')) {
    return INDIAN_BANK_CONFIGS.UNION
  }
  
  // IDBI detection
  if (headerStr.includes('idbi') || headerStr.includes('industrial development bank')) {
    return INDIAN_BANK_CONFIGS.IDBI
  }
  
  return null
}

export const getAllBankConfigs = (): BankConfig[] => {
  return Object.values(INDIAN_BANK_CONFIGS)
}