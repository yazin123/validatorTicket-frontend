'use client'
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';
import { 
  Calendar, 
  ChevronRight,
  Search, 
  Clock, 
  MapPin, 
  Plus, 
  Tag, 
  Filter, 
  Users, 
  Ticket, 
  DollarSign,
  BarChart3,
  PieChart,
  Layers,
  Edit,
  QrCode,
  Eye,
  ChevronDown,
  ArrowUpDown,
  X,
  MoreHorizontal,
  Sliders,
  Menu
} from 'lucide-react';
import Image from 'next/image';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [page, setPage] = useState(1);
  const limit = 12; // Number of events per page

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-events', page, limit],
    queryFn: async () => {
      const response = await api.get(`/admin/events?page=${page}&limit=${limit}`);
      return response.data;
    },
    keepPreviousData: true,
  });

  const events = data?.events || [];
  const pagination = data?.pagination || { total: 0, page: 1, pages: 1, limit };

  const [eventStats, setEventStats] = useState({
    published: 0,
    draft: 0,
    cancelled: 0,
    completed: 0,
    totalRevenue: 0,
    totalTickets: 0,
    soldOut: 0
  });

  useEffect(() => {
    if (events) {
      const stats = {
        published: events.filter(e => e.status === 'published').length,
        draft: events.filter(e => e.status === 'draft').length,
        cancelled: events.filter(e => e.status === 'cancelled').length,
        completed: events.filter(e => e.status === 'completed').length,
        totalRevenue: events.reduce((sum, event) => sum + (event.price * event.ticketsSold), 0),
        totalTickets: events.reduce((sum, event) => sum + event.ticketsSold, 0),
        soldOut: events.filter(e => e.ticketsSold >= e.capacity).length
      };
      setEventStats(stats);
    }
  }, [events]);

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await api.put(`/admin/events/${eventId}/status`, { status: newStatus });
      refetch();
      toast.success('Event status updated successfully');
    } catch (error) {
      toast.error('Failed to update event status');
      console.error('Error updating event status:', error);
    }
  };

  // Filter and sort events
  const filteredAndSortedEvents = events
    .filter(event => 
      (filterStatus === 'all' || event.status === filterStatus) &&
      (event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      else if (sortBy === 'revenue') return (b.price * b.ticketsSold) - (a.price * a.ticketsSold);
      else if (sortBy === 'tickets') return b.ticketsSold - a.ticketsSold;
      else return new Date(b.startDate || b.date) - new Date(a.startDate || a.date);
    });

  // Pagination controls
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(p + 1, pagination.pages));

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'draft': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-violet-50 text-violet-700 border-violet-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'published': return <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>;
      case 'draft': return <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>;
      case 'cancelled': return <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
      case 'completed': return <div className="w-2 h-2 rounded-full bg-violet-500 mr-2"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>;
    }
  };

  const getSaleProgress = (sold, capacity) => {
    const percentage = capacity > 0 ? (sold / capacity) * 100 : 0;
    let bgColor = 'bg-blue-600';
    
    if (percentage >= 90) bgColor = 'bg-emerald-600';
    else if (percentage < 30) bgColor = 'bg-amber-500';
    
    return { percentage, bgColor };
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return dateString || 'No date';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setSortBy('date');
  };

  return (
    <div className="space-y-8 max-w-9xl mx-auto px-2 py-8">
      {/* Header with Stats */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-500 mt-1">
              Manage and monitor all your events in one place
            </p>
          </div>
          <Link href="/admin/events/new">
            <div className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm">
              <Plus size={18} />
              <span className="font-medium">Create Event</span>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-100 p-2.5 rounded-lg">
                <Calendar className="text-emerald-600" size={20} />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+{Math.floor(Math.random() * 10)}% this week</span>
            </div>
            <p className="font-semibold text-2xl text-gray-900">{eventStats.published}</p>
            <p className="text-sm text-gray-500 mt-1">Published Events</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-2.5 rounded-lg">
                <Ticket className="text-blue-600" size={20} />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+{Math.floor(Math.random() * 15)}% this week</span>
            </div>
            <p className="font-semibold text-2xl text-gray-900">{eventStats.totalTickets}</p>
            <p className="text-sm text-gray-500 mt-1">Tickets Sold</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-violet-100 p-2.5 rounded-lg">
                <DollarSign className="text-violet-600" size={20} />
              </div>
              <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">+{Math.floor(Math.random() * 20)}% this week</span>
            </div>
            <p className="font-semibold text-2xl text-gray-900">₹{eventStats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-100 p-2.5 rounded-lg">
                <BarChart3 className="text-amber-600" size={20} />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">+{Math.floor(Math.random() * 5)}% this week</span>
            </div>
            <p className="font-semibold text-2xl text-gray-900">{eventStats.soldOut}</p>
            <p className="text-sm text-gray-500 mt-1">Sold Out Events</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <input
                type="search"
                placeholder="Search events by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex border border-gray-200 rounded-lg divide-x divide-gray-200">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-50'} rounded-l-lg`}
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-50'} rounded-r-lg`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="w-4 h-1 bg-current rounded-sm"></div>
                    <div className="w-4 h-1 bg-current rounded-sm"></div>
                    <div className="w-4 h-1 bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
              
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-2.5 border ${isFilterOpen ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
              >
                <Sliders size={16} />
                <span className="font-medium">Filters</span>
                {filterStatus !== 'all' && (
                  <span className="ml-1 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full w-5 h-5 text-xs font-medium">1</span>
                )}
              </button>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-medium"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="revenue">Sort by Revenue</option>
                  <option value="tickets">Sort by Tickets</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter options */}
          {isFilterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Status Filter</h3>
                {filterStatus !== 'all' && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                >
                  All Events
                </button>
                <button 
                  onClick={() => setFilterStatus('published')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></div>
                    Published
                  </div>
                </button>
                <button 
                  onClick={() => setFilterStatus('draft')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'draft' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                    Draft
                  </div>
                </button>
                <button 
                  onClick={() => setFilterStatus('cancelled')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
                    Cancelled
                  </div>
                </button>
                <button 
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'completed' ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-violet-500 mr-1.5"></div>
                    Completed
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Events Display */}
      <div className="mb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
        ) : filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-gray-500 max-w-md mx-auto">Try adjusting your search or filter to find what you're looking for.</p>
            <div className="mt-6">
              <Link href="/admin/events/new">
                <button className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus size={16} className="mr-2" /> Create New Event
                </button>
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEvents.map((event) => {
              const { percentage, bgColor } = getSaleProgress(event.ticketsSold, event.capacity);
              
              return (
                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  {/* Event Image or Placeholder */}
                  <div className="relative  h-40 flex items-center justify-center overflow-hidden">
                    {event.image ? (
                      <img 
                        src={`/${event.image}`} 
                        alt={event.title} 
                       
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <Layers className="text-white opacity-50" size={48} />
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusColor(event.status)}`}>
                      <div className="flex items-center">
                        {getStatusIcon(event.status)}
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Event Content */}
                  <div className="p-5 flex-grow">
                    <div className="flex items-center gap-1 mb-2">
                      <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {event.category || 'General'}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-900">{event.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{event.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 min-w-0">
                          <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{formatDate(event.startDate || event.date)}</span>
                        </div>
                        <div className="text-gray-300">|</div>
                        <div className="flex items-center gap-2 text-gray-600 min-w-0">
                          <DollarSign size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="font-medium">${event.price || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{event.location || 'No location specified'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-grow">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 font-medium">{event.ticketsSold} / {event.capacity}</span>
                            <span className={percentage >= 90 ? 'text-emerald-600 font-medium' : percentage < 30 ? 'text-amber-600 font-medium' : 'text-blue-600 font-medium'}>
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full">
                            <div 
                              className={`${bgColor} h-1.5 rounded-full`} 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-5 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <select
                          value={event.status}
                          onChange={(e) => handleStatusChange(event._id, e.target.value)}
                          className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-medium"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown size={14} className="text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/admin/events/${event._id}`}>
                          <button className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors" title="View Event">
                            <Eye size={16} className="text-gray-600" />
                          </button>
                        </Link>
                        <Link href={`/admin/events/${event._id}/edit`}>
                          <button className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors" title="Edit Event">
                            <Edit size={16} className="text-gray-600" />
                          </button>
                        </Link>
                        <Link href={`/admin/events/${event._id}/scan`}>
                          <button className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors" title="Scan Tickets">
                            <QrCode size={16} className="text-gray-600" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <div className="col-span-4 flex items-center gap-2">
                <span>Event</span>
                <ArrowUpDown size={14} className="text-gray-400" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span>Date</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span>Sales</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span>Revenue</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span>Status</span>
              </div>
            </div>
            
            {filteredAndSortedEvents.map((event, index) => {
              const { percentage, bgColor } = getSaleProgress(event.ticketsSold, event.capacity);
              
              return (
                <div 
                  key={event._id} 
                  className={`grid grid-cols-12 gap-4 p-4 ${index !== filteredAndSortedEvents.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors items-center`}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {event.image && event.image !== 'default-event.jpg' ? (
                        <img 
                          src={event.image} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Layers className="text-indigo-400" size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{event.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{event.location || 'No location'}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-sm text-gray-600">
                    {formatDate(event.startDate || event.date)}
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{event.ticketsSold}/{event.capacity}</span>
                        <span className={percentage >= 90 ? 'text-emerald-600 font-medium' : percentage < 30 ? 'text-amber-600 font-medium' : 'text-blue-600 font-medium'}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                        <div 
                          className={`${bgColor} h-1.5 rounded-full`} 
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      </div>
                  </div>
                  
                  <div className="col-span-2 text-sm text-gray-600 font-medium">
                    ₹{(event.price * event.ticketsSold).toLocaleString()}
                  </div>
                  
                  <div className="col-span-2">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      <div className="flex items-center">
                        {getStatusIcon(event.status)}
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-sm mt-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing <span className="font-medium">{filteredAndSortedEvents.length}</span> events</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={pagination.page === 1}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium bg-white text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="px-3 py-1.5 border border-indigo-500 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-600">
            {pagination.page}
          </div>
          <span className="text-sm">of {pagination.pages}</span>
          <button
            onClick={handleNextPage}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium bg-white text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}