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
  Activity,
  ChevronDown,
  BarChart,
  PieChart,
  AlertCircle
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

const timeRangeOptions = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last3months', label: 'Last 3 Months' }
];

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [expandedSection, setExpandedSection] = useState(null);
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [topEventsPage, setTopEventsPage] = useState(1);
  const topEventsLimit = 5;
  
  // Get the time range label
  const getTimeRangeLabel = () => {
    const option = timeRangeOptions.find(opt => opt.value === timeRange);
    return option ? option.label : 'This Month';
  };

  // Main stats query with top events pagination
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', timeRange, topEventsPage, topEventsLimit],
    queryFn: async () => {
      const response = await api.get(`/admin/stats?timeRange=${timeRange}&topEventsPage=${topEventsPage}&topEventsLimit=${topEventsLimit}`);
      return response.data || {};
    },
    keepPreviousData: true,
  });

  // Attendance stats specific query
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-stats', timeRange],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/attendance?timeRange=${timeRange}`);
      return response.data || { events: [], dailyAttendance: [] };
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
  const hasRevenue = stats?.revenue?.trend?.length > 0;
  const hasEventDistribution = stats?.eventPerformance?.length > 0;
  const hasTopEvents = stats?.topEvents?.length > 0;
  const hasAttendanceStats = attendanceData?.events?.length > 0;

  // Prepare chart data
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
    labels: stats?.revenue?.trend?.map(rev => safeFormat(rev.date)) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats?.revenue?.trend?.map(rev => rev.amount || 0) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const eventDistributionData = {
    labels: stats?.eventPerformance?.map(event => event.title || 'Untitled') || [],
    datasets: [
      {
        data: stats?.eventPerformance?.map(event => event.ticketsSold || 0) || [],
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

  const attendanceChartData = {
    labels: attendanceData?.events?.map(event => event.title || 'Untitled') || [],
    datasets: [
      {
        label: 'Registered',
        data: attendanceData?.events?.map(event => event.registeredCount || 0) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
      },
      {
        label: 'Attended',
        data: attendanceData?.events?.map(event => event.attendedCount || 0) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6,
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

  // Pagination controls for top events
  const topEventsPagination = stats?.topEventsPagination || { total: 0, page: 1, pages: 1, limit: topEventsLimit };
  const handlePrevTopEvents = () => setTopEventsPage((p) => Math.max(1, p - 1));
  const handleNextTopEvents = () => setTopEventsPage((p) => Math.min(p + 1, topEventsPagination.pages));

  // Loading state
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Performance metrics for {getTimeRangeLabel()}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
              className="flex items-center justify-between w-full sm:w-44 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{getTimeRangeLabel()}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {isTimeRangeOpen && (
              <div className="absolute right-0 z-10 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-1">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTimeRange(option.value);
                        setIsTimeRangeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded ${
                        timeRange === option.value
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Export Button */}
          <Button
            onClick={handleExportData}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className={`flex items-center ${getStatusColor(stats?.revenue?.change || 0)}`}>
              {getStatusIcon(stats?.revenue?.change || 0)}
              <span className="text-sm font-medium">{Math.abs(stats?.revenue?.change || 0)}%</span>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold mt-1">
            ₹{stats?.revenue?.total?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ₹{stats?.revenue?.period?.toLocaleString() || '0'} this period
          </p>
        </div>

        {/* Tickets Sold Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg">
              <Ticket className="h-6 w-6" />
            </div>
            <div className={`flex items-center ${getStatusColor(stats?.tickets?.change || 0)}`}>
              {getStatusIcon(stats?.tickets?.change || 0)}
              <span className="text-sm font-medium">{Math.abs(stats?.tickets?.change || 0)}%</span>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm">Tickets Sold</h3>
          <p className="text-2xl font-bold mt-1">
            {stats?.tickets?.total?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats?.tickets?.active?.toLocaleString() || '0'} active tickets
          </p>
        </div>

        {/* Active Events Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-pink-50 text-pink-600 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div className={`flex items-center ${getStatusColor(stats?.events?.change || 0)}`}>
              {getStatusIcon(stats?.events?.change || 0)}
              <span className="text-sm font-medium">{Math.abs(stats?.events?.change || 0)}%</span>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm">Active Events</h3>
          <p className="text-2xl font-bold mt-1">
            {stats?.events?.total?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats?.events?.upcoming?.toLocaleString() || '0'} upcoming
          </p>
        </div>

        {/* New Users Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div className={`flex items-center ${getStatusColor(stats?.users?.change || 0)}`}>
              {getStatusIcon(stats?.users?.change || 0)}
              <span className="text-sm font-medium">{Math.abs(stats?.users?.change || 0)}%</span>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-2xl font-bold mt-1">
            {stats?.users?.total?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats?.users?.new?.toLocaleString() || '0'} new this period
          </p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Revenue over time</p>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <TrendingUp className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
          
          <div className="h-80">
            {hasRevenue ? (
              <Bar 
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `₹${context.raw.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      }
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₹' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <BarChart className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">No revenue data available</p>
                <p className="text-sm">Try selecting a different time range</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Sales Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Ticket Sales</h2>
              <p className="text-sm text-gray-500">Number of tickets sold</p>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Ticket className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
          
          <div className="h-80">
            {hasTicketSales ? (
              <Line 
                data={ticketSalesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      }
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <BarChart className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">No ticket sales data available</p>
                <p className="text-sm">Try selecting a different time range</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Attendance and Event Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Attendance Statistics</h2>
              <p className="text-sm text-gray-500">Event attendance rates</p>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Users className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
          
          <div className="h-80">
            {!attendanceLoading && hasAttendanceStats ? (
              <Bar 
                data={attendanceChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  },
                  scales: {
                    x: {
                      stacked: false,
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    },
                    y: {
                      stacked: false,
                      grid: {
                        display: false,
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Activity className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">No attendance data available</p>
                <p className="text-sm">Try selecting a different time range</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Event Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Event Distribution</h2>
              <p className="text-sm text-gray-500">Tickets sold per event</p>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <PieChart className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
          
          <div className="h-80 flex justify-center items-center">
            {hasEventDistribution ? (
              <div className="w-full max-w-md">
                <Doughnut 
                  data={eventDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          boxWidth: 6
                        }
                      }
                    },
                    cutout: '70%'
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <PieChart className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">No event distribution data available</p>
                <p className="text-sm">Try selecting a different time range</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Top Events Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Top Performing Events</h2>
            <p className="text-sm text-gray-500">Events with highest revenue and attendance</p>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <FileText className="h-4 w-4 mr-2" />
            Full Report
          </Button>
        </div>
        
        {hasTopEvents ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Event</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Tickets Sold</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topEvents?.map((event, index) => {
                  // Calculate attendance rate if available
                  const attendanceRate = attendanceData?.events?.find(e => e.eventId === event._id)?.attendanceRate || 0;
                  
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="font-medium">{event.title}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {event.startDate ? safeFormat(event.startDate) : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{event.ticketsSold || 0}</span>
                          <div className="w-24 bg-gray-100 rounded-full h-1.5">
                            <div 
                              className="bg-purple-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(100, ((event.ticketsSold || 0) / (event.capacity || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-medium">
                        ₹{(event.revenue || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          attendanceRate > 75 ? 'bg-green-100 text-green-800' :
                          attendanceRate > 50 ? 'bg-blue-100 text-blue-800' :
                          attendanceRate > 25 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AlertCircle className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">No event data available</p>
            <p className="text-sm">Try selecting a different time range</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {topEventsPagination.pages > 1 && (
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={topEventsPagination.page === 1}
            onClick={handlePrevTopEvents}
          >
            Previous
          </Button>
          <span className="px-4 py-2">Page {topEventsPagination.page} of {topEventsPagination.pages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={topEventsPagination.page === topEventsPagination.pages}
            onClick={handleNextTopEvents}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}