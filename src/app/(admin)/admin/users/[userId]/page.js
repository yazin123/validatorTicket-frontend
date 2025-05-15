'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

export default function UserDetailsPage() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    fetchUserDetails()
    fetchUserTickets()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}`)
      setUser(response.data)
    } catch (error) {
      toast.error('Failed to fetch user details')
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTickets = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}/tickets`)
      setTickets(response.data)
    } catch (error) {
      toast.error('Failed to fetch user tickets')
      console.error('Error fetching user tickets:', error)
    }
  }

  const handleRoleChange = async (newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      await fetchUserDetails()
      toast.success('User role updated successfully')
    } catch (error) {
      toast.error('Failed to update user role')
      console.error('Error updating user role:', error)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus })
      await fetchUserDetails()
      toast.success('User status updated successfully')
    } catch (error) {
      toast.error('Failed to update user status')
      console.error('Error updating user status:', error)
    }
  }

  if (!currentUser || currentUser.role !== 'admin') {
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
          <p className="mt-4 text-gray-500">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">User Not Found</h2>
        <p className="mt-2 text-gray-500">
          The requested user could not be found.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage user information.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Back to Users
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Joined</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(user.createdAt), 'PPP')}
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
                          {ticket.event.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ticket #{ticket.ticketNumber}
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
                      <p>Date: {format(new Date(ticket.event.date), 'PPP')}</p>
                      <p>Price: ${ticket.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tickets found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 