import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSaasFlow } from '../hooks/useSaasFlow'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { 
  CreditCard, 
  Users, 
  Building2, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react'
import blink from '../lib/blink'
import toast from 'react-hot-toast'

interface FamilyMember {
  name: string
  email: string
  role: 'primary' | 'spouse' | 'member'
}

interface BankAccount {
  bankName: string
  accountType: 'savings' | 'current' | 'credit'
  accountNumber: string
  status: 'active'
}

const INDIAN_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Punjab National Bank',
  'Union Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'Indian Overseas Bank',
  'UCO Bank',
  'Bank of Maharashtra',
  'Punjab & Sind Bank',
  'Bank of India',
  'IDFC First Bank',
  'Federal Bank',
  'South Indian Bank',
  'Karnataka Bank',
  'Tamilnad Mercantile Bank',
  'City Union Bank',
  'Dhanlaxmi Bank'
]

export const ProfileSetup = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const saasState = useSaasFlow()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Family Information
  const [familyName, setFamilyName] = useState('')
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { name: user?.name || '', email: user?.email || '', role: 'primary' }
  ])

  // Step 2: Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { bankName: '', accountType: 'savings', accountNumber: '', status: 'active' }
  ])

  // Early redirect check for completed setups
  useEffect(() => {
    if (!saasState.loading && saasState.hasCompletedSetup && saasState.shouldRedirectTo === '/dashboard') {
      console.log('✅ Setup already complete - redirecting to dashboard')
      navigate('/dashboard', { replace: true })
      return
    }
  }, [saasState.loading, saasState.hasCompletedSetup, saasState.shouldRedirectTo, navigate])

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', email: '', role: 'member' }])
  }

  const removeFamilyMember = (index: number) => {
    if (index === 0) return // Can't remove primary user
    setFamilyMembers(familyMembers.filter((_, i) => i !== index))
  }

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers]
    updated[index] = { ...updated[index], [field]: value }
    setFamilyMembers(updated)
  }

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { bankName: '', accountType: 'savings', accountNumber: '', status: 'active' }])
  }

  const removeBankAccount = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index))
  }

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    const updated = [...bankAccounts]
    updated[index] = { ...updated[index], [field]: value }
    setBankAccounts(updated)
  }

  const validateStep1 = () => {
    if (!familyName.trim()) {
      toast.error('Please enter your family name')
      return false
    }
    
    for (const member of familyMembers) {
      if (!member.name.trim() || !member.email.trim()) {
        toast.error('Please fill in all family member details')
        return false
      }
    }
    
    return true
  }

  const validateStep2 = () => {
    for (const account of bankAccounts) {
      if (!account.bankName || !account.accountNumber.trim()) {
        toast.error('Please fill in all bank account details')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleComplete = async () => {
    if (!user) {
      toast.error('User not authenticated')
      return
    }

    setIsSubmitting(true)

    try {
      // Create family profile
      const familyProfile = await blink.db.familyProfiles.create({
        primaryUserId: user.id,
        familyName: familyName,
        totalMembers: familyMembers.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      console.log('✅ Family profile created:', familyProfile)

      // Create family members
      for (const member of familyMembers) {
        await blink.db.familyMembers.create({
          familyId: familyProfile.id,
          userId: member.role === 'primary' ? user.id : null, // Only primary has userId initially
          name: member.name,
          email: member.email,
          role: member.role,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      console.log('✅ Family members created')

      // Create bank accounts
      for (const account of bankAccounts) {
        await blink.db.userBankAccounts.create({
          userId: user.id,
          familyId: familyProfile.id,
          bankName: account.bankName,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          status: account.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      console.log('✅ Bank accounts created')

      // Refresh SAAS state
      await saasState.refreshSaasState()

      toast.success('Profile setup completed successfully!')

      // Navigate to dashboard
      navigate('/dashboard', { replace: true })

    } catch (error) {
      console.error('❌ Error completing setup:', error)
      toast.error('Failed to complete setup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-900">SpendWise-All</h1>
                <p className="text-xs text-primary-600">Profile Setup</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-primary-700">Welcome, {user?.email}</span>
              <Badge variant="outline" className="text-primary-600">
                Step {currentStep} of 3
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Setup Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Family Information */}
          {currentStep === 1 && (
            <Card className="border-primary-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-primary-900">Family Information</CardTitle>
                <CardDescription>
                  Tell us about your family to set up your financial management system
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="familyName" className="text-primary-900 font-medium">
                    Family Name *
                  </Label>
                  <Input
                    id="familyName"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g., The Sharma Family"
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-primary-900 font-medium">Family Members</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFamilyMember}
                      className="text-primary-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {familyMembers.map((member, index) => (
                      <div key={index} className="p-4 border border-primary-200 rounded-lg bg-primary-25">
                        <div className="flex justify-between items-center mb-3">
                          <Badge variant={member.role === 'primary' ? 'default' : 'secondary'}>
                            {member.role === 'primary' ? 'Primary User' : member.role}
                          </Badge>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFamilyMember(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm text-primary-700">Name *</Label>
                            <Input
                              value={member.name}
                              onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                              placeholder="Full name"
                              disabled={index === 0} // Primary user name from auth
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-primary-700">Email *</Label>
                            <Input
                              value={member.email}
                              onChange={(e) => updateFamilyMember(index, 'email', e.target.value)}
                              placeholder="email@example.com"
                              type="email"
                              disabled={index === 0} // Primary user email from auth
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-primary-700">Role</Label>
                            <Select
                              value={member.role}
                              onValueChange={(value) => updateFamilyMember(index, 'role', value)}
                              disabled={index === 0}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="primary">Primary</SelectItem>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Bank Accounts */}
          {currentStep === 2 && (
            <Card className="border-primary-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-primary-900">Bank Accounts</CardTitle>
                <CardDescription>
                  Add your family's bank accounts for statement processing
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <Label className="text-primary-900 font-medium">Bank Accounts</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBankAccount}
                    className="text-primary-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Account
                  </Button>
                </div>

                <div className="space-y-4">
                  {bankAccounts.map((account, index) => (
                    <div key={index} className="p-4 border border-primary-200 rounded-lg bg-primary-25">
                      <div className="flex justify-between items-center mb-3">
                        <Badge variant="secondary">Account {index + 1}</Badge>
                        {bankAccounts.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBankAccount(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm text-primary-700">Bank Name *</Label>
                          <Select
                            value={account.bankName}
                            onValueChange={(value) => updateBankAccount(index, 'bankName', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDIAN_BANKS.map((bank) => (
                                <SelectItem key={bank} value={bank}>
                                  {bank}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-primary-700">Account Type</Label>
                          <Select
                            value={account.accountType}
                            onValueChange={(value) => updateBankAccount(index, 'accountType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="savings">Savings</SelectItem>
                              <SelectItem value="current">Current</SelectItem>
                              <SelectItem value="credit">Credit Card</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-primary-700">Account Number *</Label>
                          <Input
                            value={account.accountNumber}
                            onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                            placeholder="Last 4 digits"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Complete */}
          {currentStep === 3 && (
            <Card className="border-primary-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-primary-900">Review & Complete</CardTitle>
                <CardDescription>
                  Please review your information before completing the setup
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Family Information Summary */}
                <div className="p-4 bg-primary-25 rounded-lg">
                  <h3 className="font-semibold text-primary-900 mb-3">Family Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Family Name:</span> {familyName}</p>
                    <p><span className="font-medium">Members:</span> {familyMembers.length}</p>
                    <div className="mt-3">
                      <p className="font-medium mb-2">Family Members:</p>
                      <ul className="space-y-1">
                        {familyMembers.map((member, index) => (
                          <li key={index} className="text-sm">
                            • {member.name} ({member.email}) - {member.role}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bank Accounts Summary */}
                <div className="p-4 bg-primary-25 rounded-lg">
                  <h3 className="font-semibold text-primary-900 mb-3">Bank Accounts</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Total Accounts:</span> {bankAccounts.length}</p>
                    <div className="mt-3">
                      <p className="font-medium mb-2">Accounts:</p>
                      <ul className="space-y-1">
                        {bankAccounts.map((account, index) => (
                          <li key={index} className="text-sm">
                            • {account.bankName} - {account.accountType} (****{account.accountNumber})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Current Plan Summary */}
                {saasState.currentPlan && (
                  <div className="p-4 bg-green-25 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Current Plan</h3>
                    <p className="text-green-800">
                      You're subscribed to <span className="font-medium">{saasState.currentPlan.name}</span> plan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-primary-600 hover:bg-primary-700 flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}