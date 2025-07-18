import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  ArrowLeft,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Crown,
  Upload,
  History,
  BarChart3
} from 'lucide-react'
import { XlsUpload } from '../components/XlsUpload'
import { useAuth } from '../hooks/useAuth'
import { useSaasFlow } from '../hooks/useSaasFlow'
import { useTransactions } from '../hooks/useXlsProcessing'
import { useUsageTracking } from '../hooks/useUsageTracking'
import { XlsProcessingResult } from '../types/xls'

export const TransactionUpload: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const saasState = useSaasFlow()
  const { transactions, loading, fetchTransactions } = useTransactions()
  const monthlyLimit = saasState.currentPlan?.features?.monthlyStatements || 3
  const usageTracking = useUsageTracking(monthlyLimit)
  const [activeTab, setActiveTab] = useState('upload')
  const [recentUploads, setRecentUploads] = useState<XlsProcessingResult[]>([])

  useEffect(() => {
    if (user) {
      fetchTransactions({ limit: 50 })
    }
  }, [user, fetchTransactions])

  const handleProcessingComplete = async (result: XlsProcessingResult) => {
    setRecentUploads(prev => [result, ...prev.slice(0, 4)]) // Keep last 5 uploads
    setActiveTab('history')
    
    // Track the upload
    const fileType = result.fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'xls'
    await usageTracking.trackUpload(fileType, result.processedTransactions)
    
    // Refresh transactions
    fetchTransactions({ limit: 50 })
  }

  const canUploadPDF = saasState.currentPlan?.features?.fileTypes?.includes('pdf')
  
  // Plan restrictions for upload component
  const planRestrictions = saasState.currentPlan && usageTracking.currentUsage ? {
    canUploadPDF,
    monthlyLimit,
    currentUsage: usageTracking.currentUsage.statementsUploaded,
    planName: saasState.currentPlan.name
  } : undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-primary-200" />
              <div>
                <h1 className="text-xl font-bold text-primary-900">Transaction Upload</h1>
                <p className="text-xs text-primary-600">Process bank statements with AI</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {saasState.currentPlan && (
                <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                  <Crown className="w-3 h-3 mr-1" />
                  {saasState.currentPlan.name}
                </Badge>
              )}
              <span className="text-sm text-primary-700">Welcome, {user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Overview Alert */}
        {planRestrictions && (
          <Alert className="mb-6 border-primary-200 bg-primary-25">
            <Crown className="h-4 w-4 text-primary-600" />
            <AlertDescription className="text-primary-700">
              <div className="flex items-center justify-between">
                <div>
                  <strong>{planRestrictions.planName} Plan:</strong> 
                  {' '}{planRestrictions.currentUsage}/{planRestrictions.monthlyLimit} statements used this month
                  {!planRestrictions.canUploadPDF && ' • Excel files only'}
                  {planRestrictions.canUploadPDF && ' • PDF and Excel supported'}
                </div>
                {planRestrictions.currentUsage >= planRestrictions.monthlyLimit && (
                  <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-primary-200">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <XlsUpload 
              onProcessingComplete={handleProcessingComplete}
              acceptedFileTypes={canUploadPDF ? ['.xlsx', '.xls', '.pdf'] : ['.xlsx', '.xls']}
              planRestrictions={planRestrictions}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6">
              {/* Recent Processing Results */}
              {recentUploads.length > 0 && (
                <Card className="border-primary-200">
                  <CardHeader>
                    <CardTitle className="text-primary-900 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Recent Uploads
                    </CardTitle>
                    <CardDescription>
                      Your latest file processing results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUploads.map((result, index) => (
                        <UploadResultCard key={index} result={result} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction History */}
              <Card className="border-primary-200">
                <CardHeader>
                  <CardTitle className="text-primary-900 flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>
                    All your processed transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-primary-600 mt-2">Loading transactions...</p>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {transactions.map((transaction: any, index: number) => (
                        <TransactionHistoryCard key={index} transaction={transaction} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-primary-500">
                      <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No transactions yet</p>
                      <p className="text-sm mb-4">Upload your first bank statement to get started</p>
                      <Button 
                        onClick={() => setActiveTab('upload')}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Statement
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <TransactionAnalytics transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Upload Result Card Component
const UploadResultCard: React.FC<{ result: XlsProcessingResult }> = ({ result }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const totalAmount = result.transactions.reduce((sum, t) => {
    return sum + (t.type === 'credit' ? t.amount : -t.amount)
  }, 0)

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          result.success ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{result.bankInfo.bankName}</p>
          <p className="text-sm text-gray-600">
            {result.processedTransactions} transactions processed
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-medium ${
          totalAmount >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatCurrency(Math.abs(totalAmount))}
        </div>
        <div className="text-xs text-gray-500">
          {result.processingTime}ms
        </div>
      </div>
    </div>
  )
}

// Transaction History Card Component
const TransactionHistoryCard: React.FC<{ transaction: any }> = ({ transaction }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs text-gray-600">{transaction.date}</span>
          {transaction.category && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              {transaction.category}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {transaction.bank_name}
          </Badge>
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">
          {transaction.description}
        </p>
        {transaction.vendor && (
          <p className="text-xs text-primary-600">{transaction.vendor}</p>
        )}
      </div>
      <div className="text-right ml-4">
        <div className={`font-medium ${
          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
        {transaction.confidence && (
          <div className="text-xs text-gray-500">
            {Math.round(transaction.confidence * 100)}% confidence
          </div>
        )}
      </div>
    </div>
  )
}

// Transaction Analytics Component
const TransactionAnalytics: React.FC<{ transactions: any[] }> = ({ transactions }) => {
  const totalTransactions = transactions.length
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
  const netAmount = totalCredits - totalDebits

  const categoryBreakdown = transactions.reduce((acc: any, t) => {
    const category = t.category || 'Uncategorized'
    acc[category] = (acc[category] || 0) + t.amount
    return acc
  }, {})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (totalTransactions === 0) {
    return (
      <Card className="border-primary-200">
        <CardContent className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-primary-400" />
          <p className="text-lg font-medium text-primary-700 mb-2">No data to analyze</p>
          <p className="text-sm text-primary-600">Upload some transactions to see analytics</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{totalTransactions}</div>
            <div className="text-sm text-primary-700">Total Transactions</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</div>
            <div className="text-sm text-green-700">Total Credits</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</div>
            <div className="text-sm text-red-700">Total Debits</div>
          </CardContent>
        </Card>
        <Card className={`border-${netAmount >= 0 ? 'green' : 'red'}-200`}>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(netAmount))}
            </div>
            <div className={`text-sm ${netAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Net {netAmount >= 0 ? 'Inflow' : 'Outflow'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-primary-200">
        <CardHeader>
          <CardTitle className="text-primary-900">Category Breakdown</CardTitle>
          <CardDescription>Spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 10)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm font-bold text-primary-600">
                    {formatCurrency(amount as number)}
                  </span>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}