import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Eye,
  TrendingUp,
  Building2,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react'
import { useXlsProcessing } from '../hooks/useXlsProcessing'
import { XlsProcessingResult, ProcessedTransaction } from '../types/xls'
import { getAllCategories } from '../lib/transactionCategorizer'

interface XlsUploadProps {
  onProcessingComplete?: (result: XlsProcessingResult) => void
  maxFileSize?: number
  acceptedFileTypes?: string[]
  planRestrictions?: {
    canUploadPDF: boolean
    monthlyLimit: number
    currentUsage: number
    planName: string
  }
}

export const XlsUpload: React.FC<XlsUploadProps> = ({
  onProcessingComplete,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['.xlsx', '.xls'],
  planRestrictions
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showResults, setShowResults] = useState(false)
  
  const {
    isProcessing,
    progress,
    result,
    error,
    processFile,
    validateFile,
    getSupportedBanks,
    saveTransactions,
    reset
  } = useXlsProcessing()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Check plan restrictions
    if (planRestrictions) {
      // Check monthly limit
      if (planRestrictions.currentUsage >= planRestrictions.monthlyLimit) {
        alert(`Monthly upload limit reached (${planRestrictions.monthlyLimit}). Upgrade your plan to upload more statements.`)
        return
      }

      // Check file type restrictions
      const isPDF = file.name.toLowerCase().endsWith('.pdf')
      if (isPDF && !planRestrictions.canUploadPDF) {
        alert(`PDF uploads require Valarchi or Vetri plan. Your current plan (${planRestrictions.planName}) only supports Excel files.`)
        return
      }
    }

    // Validate file
    const validation = await validateFile(file)
    if (!validation.valid) {
      // Handle validation error
      return
    }

    setSelectedFile(file)
    setShowResults(false)
  }, [validateFile, planRestrictions])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: maxFileSize
  })

  const handleProcessFile = async () => {
    if (!selectedFile) return
    
    await processFile(selectedFile)
    setShowResults(true)
  }

  const handleSaveTransactions = async () => {
    if (!result) return
    
    try {
      await saveTransactions(result)
      onProcessingComplete?.(result)
    } catch (error) {
      console.error('Error saving transactions:', error)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setShowResults(false)
    reset()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const supportedBanks = getSupportedBanks()

  return (
    <div className="space-y-6">
      {/* Plan Restrictions Alert */}
      {planRestrictions && (
        <Alert className="border-primary-200 bg-primary-25">
          <TrendingUp className="h-4 w-4 text-primary-600" />
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

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-primary-200 hover:border-primary-300 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center text-primary-900">
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Upload Bank Statement (Excel)
          </CardTitle>
          <CardDescription>
            Upload your bank statement in Excel format (.xlsx or .xls) for automatic processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`p-8 text-center cursor-pointer rounded-lg transition-colors ${
                isDragActive 
                  ? 'bg-primary-50 border-primary-300' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              } border-2 border-dashed`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary-500" />
              {isDragActive ? (
                <p className="text-primary-700 font-medium">Drop the Excel file here...</p>
              ) : (
                <div>
                  <p className="text-gray-700 font-medium mb-2">
                    Drag & drop your Excel file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .xlsx and .xls files up to {Math.round(maxFileSize / (1024 * 1024))}MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="font-medium text-primary-900">{selectedFile.name}</p>
                    <p className="text-sm text-primary-600">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {!isProcessing && !result && (
                <Button 
                  onClick={handleProcessFile}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Process Bank Statement
                </Button>
              )}
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-700">Processing...</span>
                <span className="text-sm text-primary-600">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-primary-600 text-center">
                Analyzing bank statement and categorizing transactions
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Processing Results */}
      {result && showResults && (
        <Card className="border-primary-200">
          <CardHeader>
            <CardTitle className="flex items-center text-primary-900">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Processing Complete
            </CardTitle>
            <CardDescription>
              Your bank statement has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.totalTransactions}</div>
                <div className="text-sm text-blue-700">Total Transactions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.processedTransactions}</div>
                <div className="text-sm text-green-700">Processed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.failedTransactions}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{result.processingTime}ms</div>
                <div className="text-sm text-purple-700">Processing Time</div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="flex items-center space-x-4 p-4 bg-primary-25 rounded-lg">
              <Building2 className="w-8 h-8 text-primary-600" />
              <div>
                <p className="font-medium text-primary-900">{result.bankInfo.bankName}</p>
                <p className="text-sm text-primary-600">Bank Code: {result.bankInfo.bankCode}</p>
              </div>
            </div>

            {/* Transaction Preview */}
            {result.transactions.length > 0 && (
              <div>
                <h4 className="font-medium text-primary-900 mb-3 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Transaction Preview (First 5)
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.transactions.slice(0, 5).map((transaction, index) => (
                    <TransactionPreviewCard key={index} transaction={transaction} />
                  ))}
                </div>
                {result.transactions.length > 5 && (
                  <p className="text-sm text-primary-600 mt-2 text-center">
                    ... and {result.transactions.length - 5} more transactions
                  </p>
                )}
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Processing Errors:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={handleSaveTransactions}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Save to Database
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1"
              >
                Process Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Banks */}
      <Card className="border-primary-200">
        <CardHeader>
          <CardTitle className="text-primary-900">Supported Banks</CardTitle>
          <CardDescription>
            We support automatic processing for the following Indian banks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {supportedBanks.map((bank) => (
              <Badge 
                key={bank.bankCode} 
                variant="secondary" 
                className="justify-center p-2 text-xs"
              >
                {bank.bankName}
              </Badge>
            ))}
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-primary-600">
            Don't see your bank? Contact support to add support for your bank's statement format.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Transaction Preview Component
const TransactionPreviewCard: React.FC<{ transaction: ProcessedTransaction }> = ({ 
  transaction 
}) => {
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
          <Calendar className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-600">{transaction.date}</span>
          {transaction.category && (
            <>
              <Tag className="w-3 h-3 text-primary-500" />
              <Badge variant="outline" className="text-xs px-1 py-0">
                {transaction.category}
              </Badge>
            </>
          )}
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