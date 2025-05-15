'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import QRCode from 'qrcode.react'

export default function TicketDetailsPage() {
  const { ticketId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState(null)

  useEffect(() => {
    fetchTicketDetails()
  }, [ticketId])

  const fetchTicketDetails = async () => {
    try {
      const { data } = await api.get(`/tickets/${ticketId}`)
      setTicket(data)
    } catch (error) {
      toast.error('Failed to fetch ticket details')
      console.error('Error fetching ticket details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    try {
      await api.post(`/tickets/${ticketId}/transfer`)
      toast.success('Ticket transferred successfully')
      fetchTicketDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to transfer ticket')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this ticket?')) {
      return
    }

    try {
      await api.post(`/tickets/${ticketId}/cancel`)
      toast.success('Ticket cancelled successfully')
      router.push('/tickets')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel ticket')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please sign in to view ticket details.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Ticket not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Tickets
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Event Information</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Title:</span> {ticket.event.title}</p>
            <p><span className="font-semibold">Date:</span> {new Date(ticket.event.date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Time:</span> {new Date(ticket.event.date).toLocaleTimeString()}</p>
            <p><span className="font-semibold">Location:</span> {ticket.event.location}</p>
            <p><span className="font-semibold">Description:</span> {ticket.event.description}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Ticket Information</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Ticket Number:</span> {ticket.ticketNumber}</p>
            <p><span className="font-semibold">Status:</span> <span className={`font-medium ${ticket.status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>{ticket.status}</span></p>
            <p><span className="font-semibold">Purchase Date:</span> {new Date(ticket.purchaseDate).toLocaleDateString()}</p>
            <p><span className="font-semibold">Price:</span> ${ticket.price}</p>
          </div>

          {ticket.status === 'valid' && (
            <div className="mt-6 space-y-4">
              <div className="flex gap-4">
                <Button onClick={handleTransfer}>Transfer Ticket</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel Ticket</Button>
              </div>
              <div className="flex justify-center">
                <QRCode value={ticket.ticketNumber} size={200} />
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Attendee Information</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Name:</span> {ticket.attendee.name}</p>
            <p><span className="font-semibold">Email:</span> {ticket.attendee.email}</p>
            <p><span className="font-semibold">Phone:</span> {ticket.attendee.phone}</p>
          </div>
        </Card>
      </div>
    </div>
  )
} 