'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents'
import { toast } from 'react-hot-toast'
import {
  UsersIcon,
  TicketIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data)
    } catch (error) {
      toast.error('Failed to fetch stats')
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      name: 'Manage Users',
      description: 'View and manage user accounts',
      href: '/admin/users',
      icon: UsersIcon,
    },
    {
      name: 'Manage Exhibitions',
      description: 'Create and manage exhibitions',
      href: '/admin/exhibitions',
      icon: CalendarIcon,
    },
    {
      name: 'View Reports',
      description: 'View sales and attendance reports',
      href: '/admin/reports',
      icon: CurrencyDollarIcon,
    },
  ]

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Access denied. Admin privileges required.</p>
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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Events</h3>
          <p className="text-3xl font-bold">{stats?.totalEvents || 0}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Tickets</h3>
          <p className="text-3xl font-bold">{stats?.totalTickets || 0}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">${stats?.totalRevenue || 0}</p>
        </Card>
      </div>
    </div>
  )
} 