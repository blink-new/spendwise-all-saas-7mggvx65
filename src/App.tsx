import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { PlanSelection } from './pages/PlanSelection'
import { ProfileSetup } from './pages/ProfileSetup'
import { Dashboard } from './pages/Dashboard'
import { TransactionUpload } from './pages/TransactionUpload'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Callback - redirects based on SAAS state */}
        <Route 
          path="/auth/callback" 
          element={
            <ProtectedRoute requiresAuth={true}>
              <Navigate to="/" replace />
            </ProtectedRoute>
          } 
        />
        
        {/* Plan Selection - requires auth */}
        <Route 
          path="/plans" 
          element={
            <ProtectedRoute requiresAuth={true}>
              <PlanSelection />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile Setup - requires auth + subscription */}
        <Route 
          path="/setup" 
          element={
            <ProtectedRoute 
              requiresAuth={true} 
              requiresSubscription={true}
            >
              <ProfileSetup />
            </ProtectedRoute>
          } 
        />
        
        {/* Dashboard - requires auth + subscription + setup */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute 
              requiresAuth={true} 
              requiresSubscription={true} 
              requiresSetup={true}
            >
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Transaction Upload - requires auth + subscription + setup */}
        <Route 
          path="/transactions/upload" 
          element={
            <ProtectedRoute 
              requiresAuth={true} 
              requiresSubscription={true} 
              requiresSetup={true}
            >
              <TransactionUpload />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App