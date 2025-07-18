import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  CreditCard, 
  Users, 
  Brain, 
  Shield, 
  TrendingUp, 
  FileText,
  CheckCircle,
  Star
} from 'lucide-react'

const plans = [
  {
    id: 'aarambam',
    name: 'Aarambam',
    tamil: 'ஆரம்பம்',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '1 user account',
      '1 bank account',
      'Excel statements only',
      '3 statements per month',
      'Basic AI categorization'
    ],
    popular: false,
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'kudumbam',
    name: 'Kudumbam',
    tamil: 'குடும்பம்',
    price: 299,
    description: 'Ideal for small families',
    features: [
      '2 user accounts',
      '3 bank accounts',
      'Excel statements only',
      'Unlimited statements',
      'Advanced AI categorization',
      'Family expense tracking'
    ],
    popular: true,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'valarchi',
    name: 'Valarchi',
    tamil: 'வளர்ச்சி',
    price: 599,
    description: 'Growing families need more',
    features: [
      '2 user accounts',
      '5 bank accounts',
      'PDF + Excel statements',
      'Unlimited statements',
      'Premium AI insights',
      'Budget planning tools',
      'Expense analytics'
    ],
    popular: false,
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'vetri',
    name: 'Vetri',
    tamil: 'வெற்றி',
    price: 1299,
    description: 'Complete financial mastery',
    features: [
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
    color: 'from-amber-500 to-orange-600'
  }
]

export const LandingPage = () => {
  const { login, user } = useAuth()

  const handleGetStarted = () => {
    if (user) {
      // User is already logged in, they'll be redirected by ProtectedRoute
      return
    }
    login('/plans')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-900">SpendWise-All</h1>
                <p className="text-xs text-primary-600">India's Intelligent Fintech</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-primary-700">Welcome, {user.email}</span>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </div>
              ) : (
                <Button onClick={handleGetStarted} className="bg-primary-600 hover:bg-primary-700">
                  Get Started Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-primary-100 text-primary-800 hover:bg-primary-200">
              🇮🇳 Made for Indian Families
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-900 mb-6">
              India's Most Intelligent
              <span className="block bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Family Fintech Platform
              </span>
            </h1>
            <p className="text-xl text-primary-700 max-w-3xl mx-auto mb-8">
              AI-powered personal finance management with Tamil cultural intelligence. 
              Process multiple bank statements, track family expenses, and achieve financial வெற்றி (victory) together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-primary-600 hover:bg-primary-700 text-lg px-8 py-4"
            >
              Start Free with Aarambam ஆரம்பம்
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4 border-primary-300 text-primary-700 hover:bg-primary-50"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-900">25+</div>
              <div className="text-primary-600">Indian Banks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-900">90%+</div>
              <div className="text-primary-600">AI Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-900">5</div>
              <div className="text-primary-600">Family Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-900">∞</div>
              <div className="text-primary-600">Statements</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
              Built for Indian Families
            </h2>
            <p className="text-xl text-primary-600 max-w-2xl mx-auto">
              Experience the power of AI-driven financial intelligence designed specifically for Indian banking and family structures.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-primary-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="w-12 h-12 text-primary-600 mb-4" />
                <CardTitle className="text-primary-900">AI-Powered Intelligence</CardTitle>
                <CardDescription>
                  90%+ accuracy in transaction categorization with learning patterns that understand Indian spending habits.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-primary-600 mb-4" />
                <CardTitle className="text-primary-900">Family Account Management</CardTitle>
                <CardDescription>
                  Multi-user access with role-based permissions. Perfect for Indian joint families and couples.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="w-12 h-12 text-primary-600 mb-4" />
                <CardTitle className="text-primary-900">Multi-Bank Processing</CardTitle>
                <CardDescription>
                  Support for 25+ Indian banks with both PDF and Excel statement processing capabilities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary-600 mb-4" />
                <CardTitle className="text-primary-900">Bank-Grade Security</CardTitle>
                <CardDescription>
                  Your financial data is protected with enterprise-level security and encryption.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-primary-600 mb-4" />
                <CardTitle className="text-primary-900">Smart Analytics</CardTitle>
                <CardDescription>
                  Get insights into spending patterns, budget optimization, and financial health scores.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="w-12 h-12 text-primary-600 mb-4" />
                <CardTitle className="text-primary-900">Tamil Cultural Intelligence</CardTitle>
                <CardDescription>
                  Plan names and features designed with Tamil cultural values and Indian family structures in mind.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
              Choose Your Financial Journey
            </h2>
            <p className="text-xl text-primary-600 max-w-2xl mx-auto">
              From ஆரம்பம் (beginning) to வெற்றி (victory) - find the perfect plan for your family's financial growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border-2 transition-all hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary-500 shadow-xl' 
                    : 'border-primary-200 hover:border-primary-300'
                }`}
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
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                    {plan.price > 0 && <span className="text-base font-normal text-primary-600">/month</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-primary-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={handleGetStarted}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-primary-600 hover:bg-primary-700' 
                        : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                  >
                    {plan.price === 0 ? 'Start Free' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Family's Financial Future?
          </h2>
          <p className="text-xl text-primary-200 mb-8">
            Join thousands of Indian families who trust SpendWise-All for their financial management needs.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-white text-primary-900 hover:bg-primary-50 text-lg px-8 py-4"
          >
            Start Your Journey with Aarambam ஆரம்பம்
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-950 text-primary-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SpendWise-All</span>
              </div>
              <p className="text-sm">
                India's most intelligent family fintech platform with Tamil cultural intelligence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>API</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Status</li>
                <li>Community</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 SpendWise-All. Made with ❤️ for Indian families.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}