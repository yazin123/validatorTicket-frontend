'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
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
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Users,
  Ticket,
  DollarSign,
  Download,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';

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
);

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [expandedSection, setExpandedSection] = useState(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', timeRange],
    queryFn: async () => {
      const response = await api.get(`/admin/stats?timeRange=${timeRange}`);
      const data = response.data || {};
      
      // Ensure all required properties exist
      return {
        ticketSales: Array.isArray(data.ticketSales) ? data.ticketSales : [],
        revenue: Array.isArray(data.revenue) ? data.revenue : [],
        eventDistribution: Array.isArray(data.eventDistribution) ? data.eventDistribution : [],
        topEvents: Array.isArray(data.topEvents) ? data.topEvents : [],
        totalRevenue: data.totalRevenue || 0,
        totalTicketsSold: data.totalTicketsSold || 0,
        activeEvents: data.activeEvents || 0,
        revenueChange: data.revenueChange || 0,
        ticketSalesChange: data.ticketSalesChange || 0
      };
    },
  });

  const safeFormat = (date) => {
    try {
      return format(new Date(date), 'MMM d');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Ensure we have data to display
  const hasTicketSales = stats?.ticketSales?.length > 0;
  const hasRevenue = stats?.revenue?.length > 0;
  const hasEventDistribution = stats?.eventDistribution?.length > 0;
  const hasTopEvents = stats?.topEvents?.length > 0;

  const ticketSalesData = {
    labels: stats?.ticketSales?.map(sale => safeFormat(sale.date)) || [],
    datasets: [
      {
        label: 'Tickets Sold',
        data: stats?.ticketSales?.map(sale => sale.count || 0) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const revenueData = {
    labels: stats?.revenue?.map(rev => safeFormat(rev.date)) || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: stats?.revenue?.map(rev => rev.amount || 0) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const eventDistributionData = {
    labels: stats?.eventDistribution?.map(event => event.title || 'Untitled') || [],
    datasets: [
      {
        data: stats?.eventDistribution?.map(event => event.ticketsSold || 0) || [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Helper function to determine status color based on performance
  const getStatusColor = (value) => {
    if (value > 10) return "text-emerald-500";
    if (value >= 0) return "text-blue-500";
    return "text-rose-500";
  };

  const getStatusIcon = (value) => {
    if (value >= 0) {
      return <ArrowUpRight className="h-4 w-4" />;
    }
    return <ArrowDownRight className="h-4 w-4" />;
  };

  const handleExportData = () => {
    toast.success('Report exported successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <p className="text-muted-foreground mt-2">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with title and time range selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white  p-6 rounded-xl shadow-sm border border-gray-100 ">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Performance metrics for {timeRange === 'week' ? 'this week' : timeRange === 'month' ? 'this month' : 'this year'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="inline-flex items-center rounded-lg border border-gray-200  p-1 bg-gray-50 ">
            <Button
              variant={timeRange === 'week' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-md ${timeRange === 'week' ? '' : 'hover:bg-gray-100 '}`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-md ${timeRange === 'month' ? '' : 'hover:bg-gray-100 '}`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'year' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-md ${timeRange === 'year' ? '' : 'hover:bg-gray-100 '}`}
              onClick={() => setTimeRange('year')}
            >
              Year
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white  rounded-xl p-6 shadow-sm border border-gray-100  transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-500 ">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-bold">
                  ${stats?.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
            </div>
            <div className={`rounded-full p-2 ${stats?.revenueChange >= 0 ? 'bg-emerald-50 ' : 'bg-rose-50 '}`}>
              <TrendingUp className={`h-5 w-5 ${stats?.revenueChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <div className={`flex items-center ${getStatusColor(stats?.revenueChange)}`}>
              {getStatusIcon(stats?.revenueChange)}
              <span className="text-sm font-medium">{Math.abs(stats?.revenueChange || 0)}%</span>
            </div>
            <span className="text-sm text-muted-foreground">from previous {timeRange}</span>
          </div>
        </div>

        <div className="bg-white  rounded-xl p-6 shadow-sm border border-gray-100  transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-500 ">
                <Ticket className="h-4 w-4" />
                <span className="text-sm font-medium">Tickets Sold</span>
              </div>
              <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-bold">
                  {stats?.totalTicketsSold?.toLocaleString()}
                </p>
              </div>
            </div>
            <div className={`rounded-full p-2 ${stats?.ticketSalesChange >= 0 ? 'bg-blue-50 ' : 'bg-rose-50 '}`}>
              <Users className={`h-5 w-5 ${stats?.ticketSalesChange >= 0 ? 'text-blue-500' : 'text-rose-500'}`} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <div className={`flex items-center ${getStatusColor(stats?.ticketSalesChange)}`}>
              {getStatusIcon(stats?.ticketSalesChange)}
              <span className="text-sm font-medium">{Math.abs(stats?.ticketSalesChange || 0)}%</span>
            </div>
            <span className="text-sm text-muted-foreground">from previous {timeRange}</span>
          </div>
        </div>

        <div className="bg-white  rounded-xl p-6 shadow-sm border border-gray-100  transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-500 ">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Active Events</span>
              </div>
              <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-bold">
                  {stats?.activeEvents}
                </p>
              </div>
            </div>
            <div className="rounded-full p-2 bg-purple-50 ">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <Button variant="link" className="p-0 h-auto text-sm text-primary">
              View all events
            </Button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white  rounded-xl p-6 shadow-sm border border-gray-100 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Ticket Sales Trend</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              View Details
            </Button>
          </div>
          
          {hasTicketSales ? (
            <div className="h-64">
              <Line
                data={ticketSalesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: 'bold',
                      },
                      bodyFont: {
                        size: 13,
                      },
                      cornerRadius: 6,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.1)',
                        drawBorder: false,
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50  rounded-lg border border-dashed border-gray-200 ">
              <Ticket className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-muted-foreground">No ticket sales data available</p>
              <Button variant="outline" size="sm" className="mt-4">
                Create Event
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white  rounded-xl p-6 shadow-sm border border-gray-100 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Revenue Analysis</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              View Details
            </Button>
          </div>
          
          {hasRevenue ? (
            <div className="h-64">
              <Bar
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: 'bold',
                      },
                      bodyFont: {
                        size: 13,
                      },
                      cornerRadius: 6,
                      callbacks: {
                        label: function(context) {
                          return `Revenue: $${context.raw.toLocaleString()}`;
                        }
                      }
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.1)',
                        drawBorder: false,
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50  rounded-lg border border-dashed border-gray-200 ">
              <DollarSign className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-muted-foreground">No revenue data available</p>
              <Button variant="outline" size="sm" className="mt-4">
                Set Up Pricing
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Charts and Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white  rounded-xl p-6 shadow-sm border border-gray-100 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Event Distribution</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              View All Events
            </Button>
          </div>
          
          {hasEventDistribution ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-full max-w-xs">
                <Doughnut
                  data={eventDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 12,
                          padding: 15,
                          font: {
                            size: 11,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        padding: 12,
                        titleFont: {
                          size: 14,
                          weight: 'bold',
                        },
                        bodyFont: {
                          size: 13,
                        },
                        cornerRadius: 6,
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50  rounded-lg border border-dashed border-gray-200 ">
              <Calendar className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-muted-foreground">No event distribution data available</p>
              <Button variant="outline" size="sm" className="mt-4">
                Add Events
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white  rounded-xl p-6 shadow-sm border border-gray-100 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Top Performing Events</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              View Report
            </Button>
          </div>
          
          {hasTopEvents ? (
            <div className="space-y-3 overflow-hidden">
              {stats.topEvents.map((event, index) => (
                <div
                  key={event._id || index}
                  className="flex items-center justify-between p-4 bg-gray-50  rounded-lg hover:bg-gray-100  transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-amber-100 text-amber-600  ' :
                      index === 1 ? 'bg-gray-100 text-gray-600  ' :
                      index === 2 ? 'bg-orange-100 text-orange-600  ' :
                      'bg-blue-100 text-blue-600  '
                    }`}>
                      {index < 3 ? (
                        <span className="font-bold">{index + 1}</span>
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium truncate max-w-xs">
                        {event.title || 'Untitled Event'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Ticket className="h-3 w-3" />
                        <span>{event.ticketsSold || 0} tickets</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-semibold text-right">
                      ${(event.revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                    <Button variant="ghost" size="sm" className="h-6 text-xs p-0 underline-offset-2 hover:underline">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50  rounded-lg border border-dashed border-gray-200 ">
              <TrendingUp className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-muted-foreground">No top events data available</p>
              <Button variant="outline" size="sm" className="mt-4">
                Create Event
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}