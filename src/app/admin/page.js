'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { format, subDays, subMonths } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter, 
  Calendar, 
  CalendarRange,
  Users,
  Ticket,
  DollarSign,
  ChevronDown,
  AlertCircle,
  BarChart as BarChartIcon,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  // Use an object for date range state
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'), // Default to last 30 days
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  // For presets dropdown
  const [selectedPreset, setSelectedPreset] = useState('last30days');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Apply preset date ranges
  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    
    const today = new Date();
    let start = today;
    
    switch(preset) {
      case 'today':
        start = today;
        break;
      case 'yesterday':
        start = subDays(today, 1);
        break;
      case 'last7days':
        start = subDays(today, 6); // 7 days including today
        break;
      case 'last30days':
        start = subDays(today, 29); // 30 days including today
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateRange({
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(endOfLastMonth, 'yyyy-MM-dd')
        });
        return; // Return early as we've already set both dates
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        start = subDays(today, 29); // Default to last 30 days
    }
    
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd')
    });
  };

  // Handle date input changes
  const handleDateChange = (e) => {
    setSelectedPreset('custom'); // Switch to custom when manual dates are selected
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };
  
  // Fetch data with the date range
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await api.get(`/admin/stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      return response.data;
    },
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-analytics', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/revenue?groupBy=day&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      return response.data;
    },
  });

  const { data: eventPerformance, isLoading: eventsLoading } = useQuery({
    queryKey: ['event-performance', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/events?sortBy=revenue&limit=5&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      return response.data;
    },
  });

  const { data: userStats, isLoading: usersLoading } = useQuery({
    queryKey: ['user-registrations', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await api.get(`/admin/analytics/users?groupBy=day&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      return response.data;
    },
  });

  // Color palette for charts
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];
  
  // Chart colors
  const revenueChartColors = {
    stroke: '#6366f1',
    fill: '#6366f180',
    gradient: ['#6366f120', '#6366f101']
  };
  
  const ticketSalesColors = {
    bar: '#8b5cf6',
    gradient: ['#8b5cf680', '#8b5cf620']
  };
  
  const userRegistrationColors = {
    bar: '#f43f5e',
    gradient: ['#f43f5e80', '#f43f5e20']
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      change: stats?.users?.new || 0,
      changeLabel: 'new',
      trend: stats?.users?.change || 0,
      href: '/admin/users',
      bgClass: 'bg-indigo-50',
      iconClass: 'text-indigo-600',
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Total Events',
      value: stats?.events?.total || 0,
      change: stats?.events?.upcoming || 0,
      changeLabel: 'upcoming',
      trend: stats?.events?.change || 0,
      href: '/admin/events',
      bgClass: 'bg-purple-50',
      iconClass: 'text-purple-600',
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: 'Total Tickets',
      value: stats?.tickets?.total || 0,
      change: stats?.tickets?.active || 0,
      changeLabel: 'active',
      trend: stats?.tickets?.change || 0,
      href: '/admin/tickets',
      bgClass: 'bg-pink-50',
      iconClass: 'text-pink-600',
      icon: <Ticket className="w-6 h-6" />,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.revenue?.total || 0),
      change: formatCurrency(stats?.revenue?.period || 0),
      changeLabel: 'this period',
      trend: stats?.revenue?.change || 0,
      href: '/admin/reports',
      bgClass: 'bg-rose-50',
      iconClass: 'text-rose-600',
      icon: <DollarSign className="w-6 h-6" />,
    },
  ];

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  function formatDate(dateStr) {
    try {
      return format(new Date(dateStr), 'MMM d');
    } catch (error) {
      return dateStr || '';
    }
  }

  const renderTrendArrow = (trend) => {
    if (trend > 0) {
      return (
        <div className="flex items-center text-emerald-600">
          <ArrowUpRight size={16} className="mr-1" />
          <span>{Math.abs(trend)}%</span>
        </div>
      );
    } else if (trend < 0) {
      return (
        <div className="flex items-center text-rose-600">
          <ArrowDownRight size={16} className="mr-1" />
          <span>{Math.abs(trend)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-600">
          <span>0%</span>
        </div>
      );
    }
  };

  const formatTrendPercentage = (trend) => {
    if (trend === undefined || trend === null) return '0%';
    
    const prefix = trend > 0 ? '+' : '';
    return `${prefix}${trend}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Monitor key metrics and performance indicators at a glance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {isDatePickerOpen && (
              <div className="absolute right-0 z-10 mt-2 w-80 p-4 bg-white rounded-lg border border-gray-200 shadow-lg">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={dateRange.startDate}
                          onChange={handleDateChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={dateRange.endDate}
                          onChange={handleDateChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preset Ranges</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Today', value: 'today' },
                        { label: 'Yesterday', value: 'yesterday' },
                        { label: 'Last 7 Days', value: 'last7days' },
                        { label: 'Last 30 Days', value: 'last30days' },
                        { label: 'This Month', value: 'thisMonth' },
                        { label: 'Last Month', value: 'lastMonth' },
                        { label: 'This Year', value: 'thisYear' },
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => {
                            applyPreset(preset.value);
                            setIsDatePickerOpen(false);
                          }}
                          className={`text-left px-3 py-2 text-sm rounded ${
                            selectedPreset === preset.value
                              ? 'bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Export Button */}
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            <p className="text-gray-500 mt-2">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <Link key={index} href={card.href} className="group">
                <div className="h-full bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between">
                    <div className={`w-12 h-12 rounded-lg ${card.bgClass} ${card.iconClass} flex items-center justify-center`}>
                      {card.icon}
                    </div>
                    <div>
                      {renderTrendArrow(card.trend)}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">{card.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>{card.change} {card.changeLabel}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold">Revenue Trend</h2>
                  <p className="text-gray-500 text-sm mt-1">Revenue over time</p>
                </div>
                <div className="text-sm font-medium text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded-full">
                  {formatTrendPercentage(stats?.revenue?.change)}
                </div>
              </div>
              
              <div className="h-64">
                {stats?.revenue?.trend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.revenue.trend}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={revenueChartColors.fill} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={revenueChartColors.fill} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f1f1" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${value}`}
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} labelFormatter={formatDate} />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke={revenueChartColors.stroke} 
                        fillOpacity={1} 
                        fill="url(#revenueGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <BarChartIcon size={32} className="mb-2" />
                    <p>No revenue data available for selected period</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Ticket Sales Chart */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold">Ticket Sales</h2>
                  <p className="text-gray-500 text-sm mt-1">Tickets sold over time</p>
                </div>
                <div className="text-sm font-medium text-purple-600 bg-purple-50 py-1 px-2.5 rounded-full">
                  {formatTrendPercentage(stats?.tickets?.change)}
                </div>
              </div>
              
              <div className="h-64">
                {stats?.ticketSales?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.ticketSales}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="ticketSalesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ticketSalesColors.bar} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={ticketSalesColors.bar} stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f1f1" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip formatter={(value) => [value, 'Tickets']} labelFormatter={formatDate} />
                      <Bar 
                        dataKey="count" 
                        fill="url(#ticketSalesGradient)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <BarChartIcon size={32} className="mb-2" />
                    <p>No ticket sales data available for selected period</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Bottom Section: Event Performance & Attendance Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Distribution */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Event Performance</h2>
              
              <div className="h-80">
                {stats?.eventPerformance?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={stats.eventPerformance}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="#f1f1f1" />
                      <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis 
                        dataKey="title" 
                        type="category" 
                        width={150}
                        stroke="#94a3b8" 
                        tickLine={false}
                        axisLine={false}
                        tick={props => {
                          const { x, y, payload } = props;
                          const title = payload.value;
                          // Truncate long titles
                          const displayTitle = title.length > 20 ? title.substring(0, 18) + '...' : title;
                          return (
                            <text x={x} y={y} dy={4} textAnchor="end" fontSize={11} fill="#64748b">
                              {displayTitle}
                            </text>
                          );
                        }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [value, name === 'ticketsSold' ? 'Tickets Sold' : 'Percentage Sold']}
                      />
                      <Legend />
                      <Bar 
                        name="Tickets Sold" 
                        dataKey="ticketsSold" 
                        fill="#8b5cf6" 
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar 
                        name="Percentage Sold" 
                        dataKey="percentageSold" 
                        fill="#6366f1" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <BarChartIcon size={32} className="mb-2" />
                    <p>No event performance data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Attendance Stats */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Attendance Statistics</h2>
              
              {stats?.attendanceStats?.length > 0 ? (
                <div className="space-y-4">
                  {stats.attendanceStats.map((event, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{event.eventTitle}</h3>
                        <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {event.attendanceRate}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>Registered: {event.registeredCount}</span>
                        <span>Attended: {event.attendedCount}</span>
                      </div>
                      
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${event.attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Link 
                      href="/admin/reports" 
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View detailed attendance reports →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                  <Activity size={32} className="mb-2" />
                  <p>No attendance data available</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}