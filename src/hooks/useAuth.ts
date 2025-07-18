import { useState, useEffect } from 'react'
import blink from '../lib/blink'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setAuthState({
        user: state.user,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated
      })
    })

    return unsubscribe
  }, [])

  const login = (nextUrl?: string) => {
    blink.auth.login(nextUrl)
  }

  const logout = (redirectUrl?: string) => {
    blink.auth.logout(redirectUrl)
  }

  return {
    ...authState,
    login,
    logout
  }
}