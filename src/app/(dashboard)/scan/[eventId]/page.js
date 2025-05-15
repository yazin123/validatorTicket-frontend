'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QRScanner } from '@/components/scanner/QRScanner'
import { TicketVerification } from '@/components/scanner/TicketVerification'
import { toast } from 'react-hot-toast'

export default function EventScanPage() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`)
      setEvent(response.data)
    } catch (error) {
      toast.error('Failed to fetch event details')
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async (qrData) => {
    try {
      setLoading(true)
      const response = await api.post('/tickets/verify', { 
        qrData,
        eventId 
      })
      setVerificationResult({
        status: 'success',
        ticket: response.data,
        message: 'Ticket verified successfully'
      })
      toast.success('Ticket verified successfully')
    } catch (error) {
      setVerificationResult({
        status: 'error',
        message: error.response?.data?.message || 'Failed to verify ticket'
      })
      toast.error(error.response?.data?.message || 'Failed to verify ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleError = (error) => {
    console.error('Scanner error:', error)
    toast.error('Error scanning QR code')
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-500">
          You don't have permission to access this page.
        </p>
      </div>
    )
  }

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Event Not Found</h2>
        <p className="mt-2 text-gray-500">
          The event you're looking for doesn't exist or you don't have permission to view it.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Scan Tickets - {event.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Scan QR codes to verify tickets for this event.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <QRScanner onScan={handleScan} onError={handleError} />
        <TicketVerification {...verificationResult} />
      </div>
    </div>
  )
} 