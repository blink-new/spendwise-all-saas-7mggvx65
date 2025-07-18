interface CategoryRule {
  category: string
  subcategory: string
  keywords: string[]
  priority: number
  amountRange?: { min?: number; max?: number }
  transactionType?: 'debit' | 'credit'
}

interface VendorRule {
  vendor: string
  category: string
  subcategory: string
  keywords: string[]
  confidence: number
}

// Comprehensive categorization rules for Indian transactions
const CATEGORY_RULES: CategoryRule[] = [
  // Food & Dining
  {
    category: 'Food & Dining',
    subcategory: 'Restaurants',
    keywords: ['swiggy', 'zomato', 'uber eats', 'restaurant', 'hotel', 'cafe', 'food', 'dining', 'pizza', 'burger', 'biryani'],
    priority: 9,
    transactionType: 'debit'
  },
  {
    category: 'Food & Dining',
    subcategory: 'Groceries',
    keywords: ['big bazaar', 'dmart', 'reliance fresh', 'more', 'grocery', 'supermarket', 'vegetables', 'fruits', 'milk'],
    priority: 9,
    transactionType: 'debit'
  },
  
  // Transportation
  {
    category: 'Transportation',
    subcategory: 'Fuel',
    keywords: ['petrol', 'diesel', 'fuel', 'gas station', 'hp', 'iocl', 'bpcl', 'shell', 'essar'],
    priority: 9,
    transactionType: 'debit'
  },
  {
    category: 'Transportation',
    subcategory: 'Public Transport',
    keywords: ['metro', 'bus', 'auto', 'taxi', 'ola', 'uber', 'rapido', 'train', 'irctc'],
    priority: 8,
    transactionType: 'debit'
  },
  
  // Shopping
  {
    category: 'Shopping',
    subcategory: 'Online Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'paytm mall', 'snapdeal'],
    priority: 9,
    transactionType: 'debit'
  },
  {
    category: 'Shopping',
    subcategory: 'Clothing',
    keywords: ['clothing', 'fashion', 'apparel', 'shirt', 'dress', 'shoes', 'footwear', 'textile'],
    priority: 7,
    transactionType: 'debit'
  },
  
  // Bills & Utilities
  {
    category: 'Bills & Utilities',
    subcategory: 'Electricity',
    keywords: ['electricity', 'power', 'bescom', 'mseb', 'kseb', 'tneb', 'wbsedcl', 'electric bill'],
    priority: 9,
    transactionType: 'debit'
  },
  {
    category: 'Bills & Utilities',
    subcategory: 'Mobile & Internet',
    keywords: ['airtel', 'jio', 'vi', 'vodafone', 'bsnl', 'mobile', 'internet', 'broadband', 'wifi'],
    priority: 9,
    transactionType: 'debit'
  },
  {
    category: 'Bills & Utilities',
    subcategory: 'Water',
    keywords: ['water', 'bwssb', 'mcgm', 'water bill', 'municipal'],
    priority: 8,
    transactionType: 'debit'
  },
  
  // Healthcare
  {
    category: 'Healthcare',
    subcategory: 'Medical',
    keywords: ['hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'medicine', 'apollo', 'fortis', 'max'],
    priority: 8,
    transactionType: 'debit'
  },
  {
    category: 'Healthcare',
    subcategory: 'Insurance',
    keywords: ['insurance', 'premium', 'lic', 'hdfc ergo', 'icici lombard', 'bajaj allianz', 'health insurance'],
    priority: 8,
    transactionType: 'debit'
  },
  
  // Entertainment
  {
    category: 'Entertainment',
    subcategory: 'Streaming',
    keywords: ['netflix', 'amazon prime', 'hotstar', 'zee5', 'sony liv', 'voot', 'youtube premium', 'spotify'],
    priority: 8,
    transactionType: 'debit'
  },
  {
    category: 'Entertainment',
    subcategory: 'Movies & Events',
    keywords: ['movie', 'cinema', 'pvr', 'inox', 'bookmyshow', 'concert', 'event', 'ticket'],
    priority: 7,
    transactionType: 'debit'
  },
  
  // Financial
  {
    category: 'Financial',
    subcategory: 'Investments',
    keywords: ['mutual fund', 'sip', 'zerodha', 'groww', 'upstox', 'angel broking', 'investment', 'trading'],
    priority: 9,
    transactionType: 'debit'
  },
  {
    category: 'Financial',
    subcategory: 'Loan EMI',
    keywords: ['emi', 'loan', 'home loan', 'car loan', 'personal loan', 'credit card bill', 'bajaj finserv'],
    priority: 9,
    transactionType: 'debit'
  },
  
  // Income
  {
    category: 'Income',
    subcategory: 'Salary',
    keywords: ['salary', 'wages', 'payroll', 'income', 'employer'],
    priority: 9,
    transactionType: 'credit'
  },
  {
    category: 'Income',
    subcategory: 'Interest',
    keywords: ['interest', 'fd interest', 'savings interest', 'dividend'],
    priority: 8,
    transactionType: 'credit'
  },
  
  // Transfers
  {
    category: 'Transfers',
    subcategory: 'UPI',
    keywords: ['upi', 'paytm', 'phonepe', 'googlepay', 'bhim', 'amazon pay', 'mobikwik'],
    priority: 6,
  },
  {
    category: 'Transfers',
    subcategory: 'Bank Transfer',
    keywords: ['neft', 'rtgs', 'imps', 'transfer', 'fund transfer'],
    priority: 6,
  },
  
  // ATM & Cash
  {
    category: 'Cash & ATM',
    subcategory: 'ATM Withdrawal',
    keywords: ['atm', 'cash withdrawal', 'withdrawal'],
    priority: 8,
    transactionType: 'debit'
  },
  
  // Education
  {
    category: 'Education',
    subcategory: 'Fees',
    keywords: ['school', 'college', 'university', 'education', 'fees', 'tuition', 'course'],
    priority: 8,
    transactionType: 'debit'
  },
  
  // Government & Taxes
  {
    category: 'Government & Taxes',
    subcategory: 'Tax Payment',
    keywords: ['income tax', 'tds', 'gst', 'tax', 'government', 'challan'],
    priority: 8,
    transactionType: 'debit'
  }
]

// Vendor mapping for better categorization
const VENDOR_RULES: VendorRule[] = [
  { vendor: 'Swiggy', category: 'Food & Dining', subcategory: 'Restaurants', keywords: ['swiggy'], confidence: 0.95 },
  { vendor: 'Zomato', category: 'Food & Dining', subcategory: 'Restaurants', keywords: ['zomato'], confidence: 0.95 },
  { vendor: 'Amazon', category: 'Shopping', subcategory: 'Online Shopping', keywords: ['amazon'], confidence: 0.9 },
  { vendor: 'Flipkart', category: 'Shopping', subcategory: 'Online Shopping', keywords: ['flipkart'], confidence: 0.9 },
  { vendor: 'Ola', category: 'Transportation', subcategory: 'Taxi', keywords: ['ola'], confidence: 0.9 },
  { vendor: 'Uber', category: 'Transportation', subcategory: 'Taxi', keywords: ['uber'], confidence: 0.9 },
  { vendor: 'Netflix', category: 'Entertainment', subcategory: 'Streaming', keywords: ['netflix'], confidence: 0.95 },
  { vendor: 'Airtel', category: 'Bills & Utilities', subcategory: 'Mobile & Internet', keywords: ['airtel'], confidence: 0.9 },
  { vendor: 'Jio', category: 'Bills & Utilities', subcategory: 'Mobile & Internet', keywords: ['jio'], confidence: 0.9 }
]

interface CategorizationResult {
  category: string
  subcategory: string
  vendor?: string
  confidence: number
}

export async function categorizeTransaction(
  description: string,
  amount: number,
  type: 'debit' | 'credit'
): Promise<CategorizationResult> {
  const cleanDescription = description.toLowerCase().trim()
  
  // First, try to match vendor rules
  for (const vendorRule of VENDOR_RULES) {
    for (const keyword of vendorRule.keywords) {
      if (cleanDescription.includes(keyword.toLowerCase())) {
        return {
          category: vendorRule.category,
          subcategory: vendorRule.subcategory,
          vendor: vendorRule.vendor,
          confidence: vendorRule.confidence
        }
      }
    }
  }
  
  // Then try category rules
  let bestMatch: CategoryRule | null = null
  let bestScore = 0
  let matchedKeywords = 0
  
  for (const rule of CATEGORY_RULES) {
    let score = 0
    let keywordMatches = 0
    
    // Check transaction type match
    if (rule.transactionType && rule.transactionType !== type) {
      continue
    }
    
    // Check amount range
    if (rule.amountRange) {
      if (rule.amountRange.min && amount < rule.amountRange.min) continue
      if (rule.amountRange.max && amount > rule.amountRange.max) continue
    }
    
    // Check keyword matches
    for (const keyword of rule.keywords) {
      if (cleanDescription.includes(keyword.toLowerCase())) {
        keywordMatches++
        score += rule.priority
      }
    }
    
    if (keywordMatches > 0 && score > bestScore) {
      bestMatch = rule
      bestScore = score
      matchedKeywords = keywordMatches
    }
  }
  
  if (bestMatch) {
    const confidence = Math.min(0.9, 0.5 + (matchedKeywords * 0.1) + (bestMatch.priority * 0.05))
    return {
      category: bestMatch.category,
      subcategory: bestMatch.subcategory,
      confidence
    }
  }
  
  // Default categorization based on transaction type
  if (type === 'credit') {
    return {
      category: 'Income',
      subcategory: 'Other Income',
      confidence: 0.3
    }
  } else {
    return {
      category: 'Other',
      subcategory: 'Miscellaneous',
      confidence: 0.3
    }
  }
}

// Utility function to get all available categories
export function getAllCategories(): { category: string; subcategories: string[] }[] {
  const categoryMap = new Map<string, Set<string>>()
  
  CATEGORY_RULES.forEach(rule => {
    if (!categoryMap.has(rule.category)) {
      categoryMap.set(rule.category, new Set())
    }
    categoryMap.get(rule.category)!.add(rule.subcategory)
  })
  
  return Array.from(categoryMap.entries()).map(([category, subcategories]) => ({
    category,
    subcategories: Array.from(subcategories).sort()
  }))
}

// Utility function to suggest category based on partial description
export function suggestCategory(partialDescription: string): CategorizationResult[] {
  const cleanInput = partialDescription.toLowerCase().trim()
  const suggestions: CategorizationResult[] = []
  
  CATEGORY_RULES.forEach(rule => {
    const matchScore = rule.keywords.reduce((score, keyword) => {
      if (cleanInput.includes(keyword.toLowerCase())) {
        return score + rule.priority
      }
      return score
    }, 0)
    
    if (matchScore > 0) {
      suggestions.push({
        category: rule.category,
        subcategory: rule.subcategory,
        confidence: Math.min(0.9, matchScore * 0.1)
      })
    }
  })
  
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5) // Return top 5 suggestions
}