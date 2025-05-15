'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import Link from 'next/link'

export default function EventDetailsPage() {
  const { eventId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    fetchEventDetails()
    fetchEventTickets()
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/admin/events/${eventId}`)
      setEvent(response.data)
    } catch (error) {
      toast.error('Failed to fetch event details')
      console.error('Error fetching event details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventTickets = async () => {
    try {
      const response = await api.get(`/admin/events/${eventId}/tickets`)
      setTickets(response.data)
    } catch (error) {
      toast.error('Failed to fetch event tickets')
      console.error('Error fetching event tickets:', error)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/admin/events/${eventId}/status`, { status: newStatus })
      await fetchEventDetails()
      toast.success('Event status updated successfully')
    } catch (error) {
      toast.error('Failed to update event status')
      console.error('Error updating event status:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await api.delete(`/admin/events/${eventId}`)
      toast.success('Event deleted successfully')
      router.push('/admin/events')
    } catch (error) {
      toast.error('Failed to delete event')
      console.error('Error deleting event:', error)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-500">
          You don't have permission to access this page.
        </p>
      </div>
    )
  }

  if (loading) {
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
          The requested event could not be found.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Event details and management.
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Back to Events
          </Button>
          <Link href={`/admin/events/${eventId}/edit`}>
            <Button variant="outline">
              Edit Event
            </Button>
          </Link>
          <Link href={`/admin/events/${eventId}/scan`}>
            <Button>
              Scan Tickets
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(event.date), 'PPP p')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.location}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900">${event.price}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {event.ticketsSold} / {event.capacity} tickets sold
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Ticket #{ticket.ticketNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {ticket.user.name}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Purchased: {format(new Date(ticket.createdAt), 'PPP')}</p>
                      <p>Price: ${ticket.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tickets sold yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={handleDelete}
        >
          Delete Event
        </Button>
      </div>
    </div>
  )
} 