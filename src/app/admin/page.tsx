'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { api, TokenManager } from '@/lib/api-config'

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a valid token
        const token = TokenManager.getAccessToken()
        if (!token) {
          setLoading(false)
          return
        }

        // Verify token with Django backend
        const response = await api.auth.verify()

        if (response.success) {
          setIsAuthenticated(true)
        } else {
          // Token is invalid, clear it
          TokenManager.clearTokens()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        TokenManager.clearTokens()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await api.auth.logout()
      TokenManager.clearTokens()
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout failed:', error)
      // Clear tokens anyway
      TokenManager.clearTokens()
      setIsAuthenticated(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-100">
      <Navigation />
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}
      <Footer />
    </div>
  )
}

export default AdminPage
