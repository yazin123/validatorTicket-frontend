'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function ReportsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    ticketSales: [],
    revenue: [],
    eventDistribution: [],
    topEvents: [],
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeEvents: 0
  })
  const [timeRange, setTimeRange] = useState('month')

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    try {
      const response = await api.get(`/admin/stats?timeRange=${timeRange}`)
      const data = response.data || {}
      
      // Ensure all required properties exist
      setStats({
        ticketSales: Array.isArray(data.ticketSales) ? data.ticketSales : [],
        revenue: Array.isArray(data.revenue) ? data.revenue : [],
        eventDistribution: Array.isArray(data.eventDistribution) ? data.eventDistribution : [],
        topEvents: Array.isArray(data.topEvents) ? data.topEvents : [],
        totalRevenue: data.totalRevenue || 0,
        totalTicketsSold: data.totalTicketsSold || 0,
        activeEvents: data.activeEvents || 0
      })
    } catch (error) {
      toast.error('Failed to fetch statistics')
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const safeFormat = (date) => {
    try {
      return format(new Date(date), 'MMM d')
    } catch (error) {
      return 'Invalid date'
    }
  }

  const ticketSalesData = {
    labels: stats.ticketSales.map(sale => safeFormat(sale.date)),
    datasets: [
      {
        label: 'Tickets Sold',
        data: stats.ticketSales.map(sale => sale.count || 0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  const revenueData = {
    labels: stats.revenue.map(rev => safeFormat(rev.date)),
    datasets: [
      {
        label: 'Revenue ($)',
        data: stats.revenue.map(rev => rev.amount || 0),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  const eventDistributionData = {
    labels: stats.eventDistribution.map(event => event.title || 'Untitled'),
    datasets: [
      {
        data: stats.eventDistribution.map(event => event.ticketsSold || 0),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
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
          <p className="mt-4 text-gray-500">Loading statistics...</p>
        </div>
      </div>
    )
  }

  // Ensure we have data to display
  const hasTicketSales = stats.ticketSales.length > 0;
  const hasRevenue = stats.revenue.length > 0;
  const hasEventDistribution = stats.eventDistribution.length > 0;
  const hasTopEvents = stats.topEvents.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            View event and ticket statistics.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.totalRevenue.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              {timeRange === 'week' ? 'This week' :
               timeRange === 'month' ? 'This month' :
               'This year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalTicketsSold}
            </p>
            <p className="text-sm text-gray-500">
              {timeRange === 'week' ? 'This week' :
               timeRange === 'month' ? 'This month' :
               'This year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeEvents}
            </p>
            <p className="text-sm text-gray-500">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTicketSales ? (
              <Line
                data={ticketSalesData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center py-10 text-gray-500">No ticket sales data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {hasRevenue ? (
              <Bar
                data={revenueData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center py-10 text-gray-500">No revenue data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {hasEventDistribution ? (
              <div className="h-64">
                <Pie
                  data={eventDistributionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">No event distribution data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTopEvents ? (
              <div className="space-y-4">
                {stats.topEvents.map((event, index) => (
                  <div
                    key={event._id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {event.title || 'Untitled Event'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {event.ticketsSold || 0} tickets sold
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(event.revenue || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">No top events data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 