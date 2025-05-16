'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import {
  TicketIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [featuredExhibitions, setFeaturedExhibitions] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const statsResponse = await api.get('/admin/stats')
        setStats(statsResponse.data)
        
        // Fetch featured exhibitions
        const exhibitionsResponse = await api.get('/exhibitions?featured=true&limit=3')
        setFeaturedExhibitions(exhibitionsResponse.data || [])
      } catch (error) {
        toast.error('Failed to fetch data')
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please sign in to view your dashboard.</p>
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
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Tickets</h3>
          <p className="text-3xl font-bold">{stats?.totalTickets || 0}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Active Tickets</h3>
          <p className="text-3xl font-bold">{stats?.activeTickets || 0}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
          <p className="text-3xl font-bold">{stats?.upcomingEvents || 0}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">${stats?.totalRevenue || 0}</p>
        </Card>
      </div>

      {/* Featured Exhibitions */}
      {featuredExhibitions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured Exhibitions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredExhibitions.map((exhibition) => (
              <Card key={exhibition._id} className="overflow-hidden">
                {exhibition.imageUrl && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={exhibition.imageUrl}
                      alt={exhibition.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{exhibition.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    {exhibition.location}
                  </p>
                  <a
                    href={`/exhibitions/${exhibition._id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View details &rarr;
                  </a>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-right">
            <a
              href="/exhibitions"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all exhibitions &rarr;
            </a>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/tickets"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-semibold text-gray-900">View My Tickets</span>
          </a>

          <a
            href="/exhibitions"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-semibold text-gray-900">Browse Exhibitions</span>
          </a>

          {(user?.role === 'admin' || user?.role === 'staff') && (
            <a
              href="/scan"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-semibold text-gray-900">Scan QR Code</span>
            </a>
          )}
          
          {user?.role === 'admin' && (
            <a
              href="/admin"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-semibold text-gray-900">Admin Panel</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
} 