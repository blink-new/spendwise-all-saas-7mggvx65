import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSaasFlow } from '../hooks/useSaasFlow'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import blink from '../lib/blink'
import toast from 'react-hot-toast'

const plans = [
  {
    planId: 'aarambam',
    name: 'Aarambam',
    tamil: 'ஆரம்பம்',
    priceMonthly: 0,
    description: 'Perfect for getting started with family finance management',
    features: {
      maxUsers: 1,
      maxBankAccounts: 1,
      fileTypes: ['excel'],
      monthlyStatements: 3,
      aiCategorization: 'basic',
      familyTracking: false,
      budgetPlanning: false,
      analytics: false,
      prioritySupport: false,
      apiAccess: false
    },
    featureList: [
      '1 user account',
      '1 bank account',
      'Excel statements only',
      '3 statements per month',
      'Basic AI categorization'
    ],
    popular: false,
    color: 'from-green-500 to-emerald-600',
    isActive: true
  },
  {
    planId: 'kudumbam',
    name: 'Kudumbam',
    tamil: 'குடும்பம்',
    priceMonthly: 299,
    description: 'Ideal for small families managing multiple accounts',
    features: {
      maxUsers: 2,
      maxBankAccounts: 3,
      fileTypes: ['excel'],
      monthlyStatements: -1, // unlimited
      aiCategorization: 'advanced',
      familyTracking: true,
      budgetPlanning: false,
      analytics: false,
      prioritySupport: false,
      apiAccess: false
    },
    featureList: [
      '2 user accounts',
      '3 bank accounts',
      'Excel statements only',
      'Unlimited statements',
      'Advanced AI categorization',
      'Family expense tracking'
    ],
    popular: true,
    color: 'from-blue-500 to-cyan-600',
    isActive: true
  },
  {
    planId: 'valarchi',
    name: 'Valarchi',
    tamil: 'வளர்ச்சி',
    priceMonthly: 599,
    description: 'Growing families with comprehensive financial needs',
    features: {
      maxUsers: 2,
      maxBankAccounts: 5,
      fileTypes: ['excel', 'pdf'],
      monthlyStatements: -1, // unlimited
      aiCategorization: 'premium',
      familyTracking: true,
      budgetPlanning: true,
      analytics: true,
      prioritySupport: false,
      apiAccess: false
    },
    featureList: [
      '2 user accounts',
      '5 bank accounts',
      'PDF + Excel statements',
      'Unlimited statements',
      'Premium AI insights',
      'Budget planning tools',
      'Expense analytics'
    ],
    popular: false,
    color: 'from-purple-500 to-indigo-600',
    isActive: true
  },
  {
    planId: 'vetri',
    name: 'Vetri',
    tamil: 'வெற்றி',
    priceMonthly: 1299,
    description: 'Complete financial mastery for large families',
    features: {
      maxUsers: 5,
      maxBankAccounts: 10,
      fileTypes: ['excel', 'pdf'],
      monthlyStatements: -1, // unlimited
      aiCategorization: 'enterprise',
      familyTracking: true,
      budgetPlanning: true,
      analytics: true,
      prioritySupport: true,
      apiAccess: true
    },
    featureList: [
      '5 user accounts',
      '10 bank accounts',
      'PDF + Excel statements',
      'Unlimited statements',
      'Enterprise AI features',
      'Investment tracking',
      'Tax optimization',
      'Priority support',
      'API access'
    ],
    popular: false,
    color: 'from-amber-500 to-orange-600',
    isActive: true
  }
]

export const PlanSelection = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshSaasState } = useSaasFlow()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to select a plan')
      return
    }

    setSelectedPlan(planId)
    setIsCreating(true)

    try {
      // Create user subscription
      const subscription = await blink.db.userSubscriptions.create({
        userId: user.id,
        planId: planId,
        status: 'active',
        startDate: new Date().toISOString(),
        // For free plan, no end date. For paid plans, this would be set based on billing cycle
        endDate: planId === 'aarambam' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      console.log('✅ Subscription created:', subscription)

      // Refresh SAAS state to reflect new subscription
      await refreshSaasState()

      toast.success(`Successfully subscribed to ${plans.find(p => p.planId === planId)?.name}!`)

      // Navigate to setup
      navigate('/setup', { replace: true })

    } catch (error) {
      console.error('❌ Error creating subscription:', error)
      toast.error('Failed to create subscription. Please try again.')
    } finally {
      setIsCreating(false)
      setSelectedPlan(null)
    }
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
                <p className="text-xs text-primary-600">Choose Your Plan</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-primary-700">Welcome, {user?.email}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Plan Selection */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
              Choose Your Financial Journey
            </h1>
            <p className="text-xl text-primary-600 max-w-2xl mx-auto">
              From ஆரம்பம் (beginning) to வெற்றி (victory) - select the perfect plan for your family's financial growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.planId} 
                className={`relative border-2 transition-all hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary-500 shadow-xl' 
                    : 'border-primary-200 hover:border-primary-300'
                } ${selectedPlan === plan.planId ? 'ring-2 ring-primary-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary-600 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <span className="text-2xl font-bold text-white">{plan.tamil.charAt(0)}</span>
                  </div>
                  <CardTitle className="text-2xl text-primary-900">
                    {plan.name}
                    <span className="block text-lg text-primary-600 font-normal">{plan.tamil}</span>
                  </CardTitle>
                  <div className="text-3xl font-bold text-primary-900">
                    {plan.priceMonthly === 0 ? 'Free' : `₹${plan.priceMonthly}`}
                    {plan.priceMonthly > 0 && <span className="text-base font-normal text-primary-600">/month</span>}
                  </div>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.featureList.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-primary-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSelectPlan(plan.planId)}
                    disabled={isCreating}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-primary-600 hover:bg-primary-700' 
                        : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                  >
                    {isCreating && selectedPlan === plan.planId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      plan.priceMonthly === 0 ? 'Start Free' : 'Choose Plan'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Plan Comparison */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-primary-900 text-center mb-8">
              Detailed Plan Comparison
            </h2>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary-900">Features</th>
                      {plans.map((plan) => (
                        <th key={plan.planId} className="px-6 py-4 text-center text-sm font-semibold text-primary-900">
                          {plan.name} {plan.tamil}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">User Accounts</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.maxUsers}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-primary-25">
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">Bank Accounts</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.maxBankAccounts}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">File Types</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.fileTypes.includes('pdf') ? 'PDF + Excel' : 'Excel Only'}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-primary-25">
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">Monthly Statements</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.monthlyStatements === -1 ? 'Unlimited' : plan.features.monthlyStatements}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">AI Categorization</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700 capitalize">
                          {plan.features.aiCategorization}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-primary-25">
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">Family Tracking</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.familyTracking ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-primary-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">Budget Planning</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.budgetPlanning ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-primary-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-primary-25">
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">Analytics</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.analytics ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-primary-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">Priority Support</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.prioritySupport ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-primary-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-primary-25">
                      <td className="px-6 py-4 text-sm font-medium text-primary-900">API Access</td>
                      {plans.map((plan) => (
                        <td key={plan.planId} className="px-6 py-4 text-center text-sm text-primary-700">
                          {plan.features.apiAccess ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-primary-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}