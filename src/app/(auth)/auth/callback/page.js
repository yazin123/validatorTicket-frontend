// app/(auth)/auth/callback/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { processGoogleCallback } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        const token = searchParams.get('token')
        
        if (token) {
          const result = await processGoogleCallback(token)
          
          if (result.success) {
            toast.success('Signed in successfully!')
            
            // Redirect to dashboard or admin panel based on user role
            router.push('/dashboard')
          } else {
            throw new Error(result.error || 'Authentication failed')
          }
        } else {
          throw new Error('No authentication token received')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error(error.message || 'Authentication failed')
        router.push('/login?error=auth_failed')
      } finally {
        setIsProcessing(false)
      }
    }
    
    processAuth()
  }, [searchParams, router, processGoogleCallback])
  
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
          <p className="text-muted-foreground">Please wait while we complete the sign-in process.</p>
        </div>
      </div>
    )
  }
  
  return null
}