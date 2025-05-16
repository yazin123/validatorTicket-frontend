'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import api from '@/lib/api'

export default function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets () {
    try {
      const { data } = await api.get('/tickets')
      console.log('Tickets API response:', data)
      setTickets(Array.isArray(data) ? data : []) // Ensure it’s an array
    } catch (error) {
      toast.error('Failed to fetch tickets')
      console.error('Error fetching tickets:', error)
      setTickets([]) // Fallback to avoid runtime error
    } finally {
      setLoading(false)
    }
  }
  

  const handleTransfer = async (ticketId) => {
    try {
      await api.post(`/tickets/${ticketId}/transfer`)
      toast.success('Ticket transferred successfully')
      fetchTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to transfer ticket')
    }
  }

  const handleCancel = async (ticketId) => {
    try {
      await api.post(`/tickets/${ticketId}/cancel`)
      toast.success('Ticket cancelled successfully')
      fetchTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel ticket')
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase()
    return (
      ticket.event.title.toLowerCase().includes(searchLower) ||
      ticket.ticketNumber.toLowerCase().includes(searchLower) ||
      ticket.status.toLowerCase().includes(searchLower)
    )
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please sign in to view your tickets.</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {filteredTickets.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No tickets found.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket._id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{ticket.event.title}</h3>
                  <p className="text-sm text-gray-500">Ticket #{ticket.ticketNumber}</p>
                  <p className="text-sm text-gray-500">
                    Status: <span className={`font-medium ${ticket.status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                      {ticket.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Purchase Date: {new Date(ticket.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/tickets/${ticket._id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                  {ticket.status === 'valid' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleTransfer(ticket._id)}
                      >
                        Transfer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCancel(ticket._id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 