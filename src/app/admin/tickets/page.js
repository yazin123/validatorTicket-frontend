'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Badge } from '@/components/ui/Badge'; // You may need to create this component
import { Search, Filter, Calendar, User, Ticket, Clock, CreditCard, AlertTriangle } from 'lucide-react'; // Import icons

// Status badge component with appropriate colors
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'used':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const { data: ticketsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets');
      return response.data;
    },
  });

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status: newStatus });
      refetch();
      toast.success('Ticket status updated successfully');
    } catch (error) {
      toast.error('Failed to update ticket status');
      console.error('Error updating ticket status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 rounded-full bg-emerald-500"></div>;
      case 'used':
        return <div className="w-3 h-3 rounded-full bg-blue-500"></div>;
      case 'cancelled':
        return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
      case 'expired':
        return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-300"></div>;
    }
  };

  const filteredTickets = ticketsData?.data?.filter(ticket => {
    // Check if the ticket and its properties exist before filtering
    const ticketNumber = ticket.ticketNumber || '';
    const userName = ticket.purchasedBy?.name || '';
    const userEmail = ticket.purchasedBy?.email || '';
    const eventNames = ticket.events?.map(e => e.event?.name || '').join(' ') || '';
    
    const matchesSearch = 
      ticketNumber.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eventNames.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ticket Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all tickets for exhibitions and events.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/scan">
            <Button className="flex items-center gap-2">
              <Ticket size={18} />
              Scan Tickets
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-background rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Tickets</h2>
            {ticketsData?.data && (
              <Badge variant="outline">{ticketsData.data.length} Total</Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setView('grid')}
                className={`p-2 rounded-md ${view === 'grid' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-2 rounded-md ${view === 'list' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
              </button>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="search"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 w-64 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertTriangle size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No tickets found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        ) : view === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
              // Get the first event if available
              const firstEvent = ticket.events && ticket.events.length > 0 ? ticket.events[0] : null;
              const eventName = firstEvent?.event?.name || 'N/A';
              const eventCount = ticket.events?.length || 0;
              
              return (
                <div key={ticket._id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{ticket.ticketNumber}</h3>
                        <p className="text-sm text-gray-500">{eventCount} {eventCount === 1 ? 'Event' : 'Events'}</p>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-700">
                          {ticket.purchaseDate && format(new Date(ticket.purchaseDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-gray-400" />
                        <div>
                          <span className="text-gray-700 font-medium">{ticket.purchasedBy?.name || 'N/A'}</span>
                          <br />
                          <span className="text-gray-500">{ticket.purchasedBy?.email || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Ticket size={16} className="text-gray-400" />
                        <span className="text-gray-700">{eventName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="text-gray-700">${ticket.totalAmount || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="active">Active</option>
                          <option value="used">Used</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="expired">Expired</option>
                        </select>
                        
                        <div className="flex space-x-2">
                          <Link href={`/admin/tickets/${ticket._id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/admin/tickets/${ticket._id}/print`, '_blank')}
                          >
                            Print
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              // Get the first event if available
              const firstEvent = ticket.events && ticket.events.length > 0 ? ticket.events[0] : null;
              const eventName = firstEvent?.event?.name || 'N/A';
              const eventCount = ticket.events?.length || 0;
              
              return (
                <div key={ticket._id} className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                        <Ticket size={24} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{ticket.ticketNumber}</h3>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <p className="text-sm text-gray-500">
                          {eventName} {eventCount > 1 ? `+ ${eventCount - 1} more` : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500">Purchaser</p>
                        <p className="text-sm font-medium">{ticket.purchasedBy?.name || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium">
                          {ticket.purchaseDate && format(new Date(ticket.purchaseDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-sm font-medium">${ticket.totalAmount || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="active">Active</option>
                        <option value="used">Used</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </select>
                      
                      <Link href={`/admin/tickets/${ticket._id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/admin/tickets/${ticket._id}/print`, '_blank')}
                      >
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination could be added here */}
        {ticketsData?.pagination && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((ticketsData.pagination.page - 1) * ticketsData.pagination.limit) + 1} to {Math.min(ticketsData.pagination.page * ticketsData.pagination.limit, ticketsData.pagination.total)} of {ticketsData.pagination.total} tickets
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={ticketsData.pagination.page === 1}
                onClick={() => {
                  // Handle pagination
                }}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={ticketsData.pagination.page === ticketsData.pagination.totalPages}
                onClick={() => {
                  // Handle pagination
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}