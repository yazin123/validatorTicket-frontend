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
  Eye
} from 'lucide-react';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const response = await api.get('/admin/events');
      return response.data;
    },
  });

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
  const filteredAndSortedEvents = events ? events
    .filter(event => 
      (filterStatus === 'all' || event.status === filterStatus) &&
      (event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'revenue') {
        return (b.price * b.ticketsSold) - (a.price * a.ticketsSold);
      } else if (sortBy === 'tickets') {
        return b.ticketsSold - a.ticketsSold;
      } else {
        // Default to date
        return new Date(b.startDate || b.date) - new Date(a.startDate || a.date);
      }
    }) : [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSaleProgress = (sold, capacity) => {
    const percentage = capacity > 0 ? (sold / capacity) * 100 : 0;
    let bgColor = 'bg-blue-500';
    if (percentage >= 90) bgColor = 'bg-green-500';
    else if (percentage < 30) bgColor = 'bg-orange-500';
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

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor all your events in one place
            </p>
          </div>
          <Link href="/admin/events/new">
            <div className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus size={18} />
              <span>Create Event</span>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between border border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Published Events</p>
              <p className="text-2xl font-bold">{eventStats.published}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="text-green-600" size={20} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between border border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Total Tickets Sold</p>
              <p className="text-2xl font-bold">{eventStats.totalTickets}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Ticket className="text-blue-600" size={20} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between border border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">${eventStats.totalRevenue}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="text-purple-600" size={20} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between border border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Sold Out Events</p>
              <p className="text-2xl font-bold">{eventStats.soldOut}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <BarChart3 className="text-orange-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="tickets">Sort by Tickets Sold</option>
            </select>
          </div>
        </div>
        
        {/* Filter options */}
        {isFilterOpen && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterStatus('published')}
              className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
            >
              Published
            </button>
            <button 
              onClick={() => setFilterStatus('draft')}
              className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'draft' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Draft
            </button>
            <button 
              onClick={() => setFilterStatus('cancelled')}
              className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
            >
              Cancelled
            </button>
            <button 
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-full text-sm ${filterStatus === 'completed' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}
            >
              Completed
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="mb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
        ) : filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            <div className="mt-6">
              <Link href="/admin/events/new">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" /> Create New Event
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEvents.map((event) => {
              const { percentage, bgColor } = getSaleProgress(event.ticketsSold, event.capacity);
              
              return (
                <div key={event._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col">
                  {/* Event Image or Placeholder */}
                  <div className="relative bg-gradient-to-r from-blue-400 to-blue-600 h-32 flex items-center justify-center">
                    {event.image && event.image !== 'default-event.jpg' ? (
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Layers className="text-white" size={36} />
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </div>
                  </div>
                  
                  {/* Event Content */}
                  <div className="p-4 flex-grow">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{event.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-600">{formatDate(event.startDate || event.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-gray-600 line-clamp-1">{event.location || 'No location specified'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-gray-600">${event.price || 0}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-gray-400" />
                        <div className="flex-grow">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">{event.ticketsSold} / {event.capacity}</span>
                            <span className="text-gray-600">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${bgColor} h-2 rounded-full`} 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Controls */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event._id, e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                      
                      <div className="flex gap-2">
                        <Link href={`/admin/events/${event._id}`}>
                          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors" title="View Event">
                            <Eye size={16} />
                          </button>
                        </Link>
                        <Link href={`/admin/events/${event._id}/edit`}>
                          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors" title="Edit Event">
                            <Edit size={16} />
                          </button>
                        </Link>
                        <Link href={`/admin/events/${event._id}/scan`}>
                          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors" title="Scan Tickets">
                            <QrCode size={16} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}