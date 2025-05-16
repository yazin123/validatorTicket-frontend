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
      trend: stats?.users?.trend || 0,
      href: '/admin/users',
      bgClass: 'bg-indigo-50 ',
      iconClass: 'text-indigo-600 ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      title: 'Total Events',
      value: stats?.events?.total || 0,
      change: stats?.events?.upcoming || 0,
      changeLabel: 'upcoming',
      trend: stats?.events?.trend || 5,
      href: '/admin/events',
      bgClass: 'bg-purple-50 ',
      iconClass: 'text-purple-600 ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      title: 'Total Tickets',
      value: stats?.tickets?.total || 0,
      change: stats?.tickets?.active || 0,
      changeLabel: 'active',
      trend: stats?.tickets?.trend || 12,
      href: '/admin/tickets',
      bgClass: 'bg-pink-50 ',
      iconClass: 'text-pink-600 ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
      ),
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.revenue?.total || 0),
      change: formatCurrency(stats?.revenue?.period || 0),
      changeLabel: 'this period',
      trend: stats?.revenue?.trend || 8,
      href: '/admin/finance',
      bgClass: 'bg-rose-50 ',
      iconClass: 'text-rose-600 ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Format helpers
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'MMM d, yyyy');
  }

  // Date range presets
  const timeRangePresets = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Initialize with default preset
  useEffect(() => {
    applyPreset('last30days');
  }, []);

  // Generate trend arrow based on number
  const renderTrendArrow = (trend) => {
    if (trend > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500">
          <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
        </svg>
      );
    } else if (trend < 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-rose-500">
          <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500">
          <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
        </svg>
      );
    }
  };
  
  // Format trend percentage
  const formatTrendPercentage = (trend) => {
    const trendAbs = Math.abs(trend);
    return `${trendAbs}%`;
  };

  return (
    <div className="min-h-screen   ">
      <div className="max-w-9xl mx-auto space-y-8">
        <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 ">Dashboard</h1>
              <p className="text-gray-500  mt-1">
                An overview of your event system performance
              </p>
            </div>
            
            {/* Modern Date Range Picker */}
            <div className="relative">
              <button 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center space-x-2 bg-white  border border-gray-200  rounded-lg px-4 py-2 text-sm text-gray-700  hover:bg-gray-50  transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>{formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              {isDatePickerOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white  rounded-lg shadow-lg border border-gray-200  z-10">
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900  text-sm mb-3">Date Range</h4>
                    
                    <div className="space-y-3">
                      {/* Presets */}
                      <div className="grid grid-cols-2 gap-2">
                        {timeRangePresets.slice(0, 6).map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => {
                              applyPreset(preset.value);
                              if (preset.value !== 'custom') setIsDatePickerOpen(false);
                            }}
                            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                              selectedPreset === preset.value
                                ? 'bg-indigo-100  text-indigo-700 '
                                : 'text-gray-700  hover:bg-gray-100 '
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom Range Fields */}
                      <div className="space-y-2 pt-2 border-t border-gray-200 ">
                        <div className="flex flex-col">
                          <label htmlFor="startDate" className="text-xs text-gray-500  mb-1">Start Date</label>
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="border border-gray-200   rounded-md text-sm px-3 py-2"
                          />
                        </div>
                        
                        <div className="flex flex-col">
                          <label htmlFor="endDate" className="text-xs text-gray-500  mb-1">End Date</label>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="border border-gray-200   rounded-md text-sm px-3 py-2"
                          />
                        </div>
                      </div>
                      
                      {/* Apply & Cancel Buttons */}
                      <div className="flex justify-between pt-2">
                        <button 
                          onClick={() => setIsDatePickerOpen(false)}
                          className="text-sm px-3 py-1.5 text-gray-600  hover:bg-gray-100  rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => setIsDatePickerOpen(false)}
                          className="text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid place-items-center h-64">
              <div className="h-12 w-12 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => (
                <Link 
                  key={index} 
                  href={card.href}
                  className="group bg-white  rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200  overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 ${card.bgClass} rounded-lg ${card.iconClass}`}>
                        {card.icon}
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderTrendArrow(card.trend)}
                        <span className={`text-sm font-medium ${
                          card.trend > 0 ? 'text-emerald-500' : 
                          card.trend < 0 ? 'text-rose-500' : 
                          'text-gray-500 '
                        }`}>
                          {formatTrendPercentage(card.trend)}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-medium text-gray-500 ">{card.title}</h3>
                    <p className="text-3xl font-bold mt-1 text-gray-900 ">
                      {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                    </p>
                    <p className="text-sm text-gray-500  mt-2">
                      <span className="font-medium">{card.change}</span> {card.changeLabel}
                    </p>
                  </div>
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-indigo-400 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300"></div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 ">Revenue</h2>
                  <p className="text-sm text-gray-500 ">Total revenue over time</p>
                </div>
                <Link href="/admin/finance" className="text-indigo-600  text-sm font-medium hover:underline flex items-center gap-1">
                  Details
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>

              {revenueLoading ? (
                <div className="h-64 grid place-items-center">
                  <div className="h-8 w-8 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
              ) : revenueData?.data && (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData.data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={revenueChartColors.fill} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={revenueChartColors.fill} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="period" 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return format(date, 'MMM d');
                        }}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => {
                          return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                            compactDisplay: 'short'
                          }).format(value);
                        }}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                          border: '1px solid #e5e7eb'
                        }}
                        formatter={(value) => [formatCurrency(value), "Revenue"]}
                        labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={revenueChartColors.stroke} 
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Sales Chart */}
          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 ">Ticket Sales</h2>
                  <p className="text-sm text-gray-500 ">Daily ticket sales volume</p>
                </div>
                <Link href="/admin/tickets" className="text-indigo-600  text-sm font-medium hover:underline flex items-center gap-1">
                  Details
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
</svg>
                </Link>
              </div>

              {revenueLoading ? (
                <div className="h-64 grid place-items-center">
                  <div className="h-8 w-8 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
              ) : revenueData?.data && (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData.data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ticketSalesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ticketSalesColors.bar} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={ticketSalesColors.bar} stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="period" 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return format(date, 'MMM d');
                        }}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                          border: '1px solid #e5e7eb'
                        }}
                        formatter={(value) => [value, "Tickets Sold"]}
                        labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      />
                      <Bar 
                        dataKey="tickets" 
                        fill="url(#ticketSalesGradient)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Events */}
          <div className="lg:col-span-2 bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 ">Top Events</h2>
                  <p className="text-sm text-gray-500 ">Best performing events by revenue</p>
                </div>
                <Link href="/admin/events" className="text-indigo-600  text-sm font-medium hover:underline flex items-center gap-1">
                  View all
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>

              {eventsLoading ? (
                <div className="h-64 grid place-items-center">
                  <div className="h-8 w-8 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
              ) : eventPerformance?.data && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500  border-b border-gray-200 ">
                        <th className="pb-3 font-medium">Event</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Tickets Sold</th>
                        <th className="pb-3 font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventPerformance.data.map((event, index) => (
                        <tr key={index} className="border-b last:border-b-0 border-gray-100 ">
                          <td className="py-4 pr-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100  grid place-items-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 ">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 ">{event.name}</p>
                                <p className="text-xs text-gray-500 ">{event.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 ">
                            {formatDate(event.date)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="font-medium text-sm text-gray-900 ">
                                {event.ticketsSold}/{event.capacity}
                              </div>
                              <div className="ml-2 w-16 bg-gray-200  rounded-full h-1.5">
                                <div className="bg-purple-600 h-1.5 rounded-full" style={{width: `${(event.ticketsSold / event.capacity * 100)}%`}}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pl-4 text-sm font-medium text-gray-900 ">
                            {formatCurrency(event.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 ">User Registrations</h2>
                  <p className="text-sm text-gray-500 ">New users over time</p>
                </div>
              </div>

              {usersLoading ? (
                <div className="h-64 grid place-items-center">
                  <div className="h-8 w-8 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
              ) : userStats?.data && (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userStats.data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={userRegistrationColors.bar} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={userRegistrationColors.bar} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return format(date, 'MMM d');
                        }}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                          border: '1px solid #e5e7eb'
                        }}
                        formatter={(value) => [value, "New Users"]}
                        labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke={userRegistrationColors.bar} 
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}