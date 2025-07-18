import { useAuth } from '../hooks/useAuth'
import { useSaasFlow } from '../hooks/useSaasFlow'
import { useUsageTracking } from '../hooks/useUsageTracking'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  CreditCard, 
  Upload, 
  TrendingUp, 
  Users, 
  Building2, 
  FileText,
  Settings,
  LogOut,
  Crown
} from 'lucide-react'

export const Dashboard = () => {
  const { user, logout } = useAuth()
  const saasState = useSaasFlow()
  const monthlyLimit = saasState.currentPlan?.features?.monthlyStatements || 3
  const usageTracking = useUsageTracking(monthlyLimit)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-900">SpendWise-All</h1>
                <p className="text-xs text-primary-600">Dashboard</p>
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
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-900 mb-2">
            Welcome to your Financial Dashboard
          </h2>
          <p className="text-primary-600">
            Manage your family's finances with AI-powered intelligence
          </p>
        </div>

        {/* Usage Overview */}
        {usageTracking.currentUsage && (
          <div className="mb-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-primary-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {usageTracking.currentUsage.statementsUploaded}/{monthlyLimit}
                  </div>
                  <div className="text-sm text-primary-700">Statements This Month</div>
                  <div className="w-full bg-primary-100 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (usageTracking.currentUsage.statementsUploaded / monthlyLimit) * 100)}%` 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {usageTracking.currentUsage.transactionsProcessed}
                  </div>
                  <div className="text-sm text-green-700">Transactions Processed</div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {usageTracking.currentUsage.xlsUploads}
                  </div>
                  <div className="text-sm text-blue-700">Excel Files</div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {usageTracking.currentUsage.pdfUploads}
                  </div>
                  <div className="text-sm text-purple-700">PDF Files</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="border-primary-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/transactions/upload')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-primary-900">Upload Statements</CardTitle>
              <CardDescription className="text-sm">
                Process bank statements with AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-primary-900">Analytics</CardTitle>
              <CardDescription className="text-sm">
                View spending insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-primary-900">Family</CardTitle>
              <CardDescription className="text-sm">
                Manage family members
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-primary-900">Settings</CardTitle>
              <CardDescription className="text-sm">
                Configure your account
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary-200">
              <CardHeader>
                <CardTitle className="text-primary-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Your latest financial activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-primary-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No transactions yet</p>
                  <p className="text-sm mb-4">Upload your first bank statement to get started</p>
                  <Button 
                    className="bg-primary-600 hover:bg-primary-700"
                    onClick={() => navigate('/transactions/upload')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Statement
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary-200">
              <CardHeader>
                <CardTitle className="text-primary-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Spending Overview
                </CardTitle>
                <CardDescription>
                  Monthly spending patterns and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-primary-500">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No data available</p>
                  <p className="text-sm">Upload statements to see spending analytics</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Account Info */}
          <div className="space-y-6">
            {/* Current Plan */}
            <Card className="border-primary-200">
              <CardHeader>
                <CardTitle className="text-primary-900 flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {saasState.currentPlan ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-900">
                        {saasState.currentPlan.name}
                      </div>
                      <div className="text-primary-600">
                        {saasState.currentPlan.features?.priceMonthly === 0 
                          ? 'Free Plan' 
                          : `₹${saasState.currentPlan.features?.priceMonthly}/month`
                        }
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Users:</span>
                        <span>{saasState.currentPlan.features?.maxUsers || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bank Accounts:</span>
                        <span>{saasState.currentPlan.features?.maxBankAccounts || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>File Types:</span>
                        <span>
                          {saasState.currentPlan.features?.fileTypes?.includes('pdf') 
                            ? 'PDF + Excel' 
                            : 'Excel Only'
                          }
                        </span>
                      </div>
                    </div>

                    {saasState.currentPlan.features?.priceMonthly === 0 ? (
                      <Button 
                        className="w-full bg-primary-600 hover:bg-primary-700"
                        onClick={() => navigate('/plans')}
                      >
                        Upgrade Plan
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        Manage Plan
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-primary-600 mb-4">No active plan</p>
                    <Button className="bg-primary-600 hover:bg-primary-700">
                      Choose Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Family Members */}
            <Card className="border-primary-200">
              <CardHeader>
                <CardTitle className="text-primary-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Family Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-primary-25 rounded-lg">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary-900">{user?.name || 'You'}</p>
                      <p className="text-sm text-primary-600">{user?.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Primary</Badge>
                  </div>
                  
                  <Button variant="outline" className="w-full text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    Invite Family Members
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bank Accounts */}
            <Card className="border-primary-200">
              <CardHeader>
                <CardTitle className="text-primary-900 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Bank Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-primary-400" />
                  <p className="text-sm text-primary-600 mb-3">No bank accounts configured</p>
                  <Button variant="outline" className="w-full text-sm">
                    <Building2 className="w-4 h-4 mr-2" />
                    Add Bank Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}