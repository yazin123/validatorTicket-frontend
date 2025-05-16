//old code
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { QRScanner } from '@/components/scanner/QRScanner'
import { TicketVerification } from '@/components/scanner/TicketVerification'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ScanPage() {
  const { user } = useAuth()
  const [verificationResult, setVerificationResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleScan = async (qrData) => {
    try {
      setLoading(true)
      const response = await api.post('/tickets/verify', { qrData })
      
      // Log the response for debugging
      console.log('API Response:', response.data)
      
      // Extract ticket data from the response
      let ticketData = response.data.ticket || response.data.data || {}
      
      // If ticket is not already an object, create an empty object
      if (typeof ticketData !== 'object' || ticketData === null) {
        console.warn('Ticket data is not an object:', ticketData)
        ticketData = {}
      }
      
      // Create a status object based on the ticket data
      const statusInfo = response.data.statusInfo || {}
      const canBeUsed = statusInfo.canBeUsed || (ticketData.status === 'valid')
      const statusMessage = statusInfo.statusMessage || (canBeUsed ? 'Ticket verified successfully' : 'Ticket cannot be used')
      
      setVerificationResult({
        status: 'success',
        ticket: ticketData,
        canBeUsed: canBeUsed,
        message: statusMessage
      })
      
      toast.success('Ticket verified successfully')
    } catch (error) {
      console.error('Verification error:', error)
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
  
  const handleMarkAsUsed = async (ticketId) => {
    try {
      // Refresh ticket data after marking as used
      const response = await api.get(`/tickets/${ticketId}`)
      
      // Verify ticket data structure
      let updatedTicket = response.data.data
      if (typeof updatedTicket !== 'object' || updatedTicket === null) {
        console.warn('Updated ticket data is not an object:', updatedTicket)
        updatedTicket = {}
      }
      
      // Update the verification result with the updated ticket
      setVerificationResult({
        ...verificationResult,
        ticket: updatedTicket,
        message: 'Ticket has been marked as used'
      })
    } catch (error) {
      console.error('Error refreshing ticket:', error)
      toast.error('Error refreshing ticket data')
    }
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Scan Ticket</h1>
        <p className="mt-1 text-sm text-gray-500">
          Scan the QR code on a ticket to verify its validity.
        </p>
      </div>

      <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Staff Instructions</AlertTitle>
        <AlertDescription>
          <p>1. Scan any ticket to view its details</p>
          <p>2. Valid tickets will show a "Mark as Used" button</p>
          <p>3. Only click "Mark as Used" after confirming attendee identity</p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <QRScanner onScan={handleScan} onError={handleError} />
        <TicketVerification {...verificationResult} onMarkAsUsed={handleMarkAsUsed} />
      </div>
    </div>
  )
} 