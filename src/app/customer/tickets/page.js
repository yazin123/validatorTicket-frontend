"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Ticket, Clock, MapPin, Calendar, Tag, AlertCircle, User,
  CheckCircle, XCircle, Download, Share2, ChevronDown, ChevronUp,
  Calendar as CalendarIcon, Clock as ClockIcon, CreditCard, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await api.get("/tickets/me");
        // Handle both API response formats (tickets or data property)
        const ticketData = res.data.tickets || res.data.data;
        setTickets(ticketData);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const toggleTicketExpand = (ticketId) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
    } else {
      setExpandedTicket(ticketId);
    }
  };

  const downloadQrCode = (qrCode, ticketNumber) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket-${ticketNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareTicket = async (ticket) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${ticket.event?.title || 'Event'}`,
          text: `My ticket for ${ticket.event?.title || 'Event'} on ${new Date(ticket.event?.startDate).toLocaleDateString()}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard'))
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
      case 'valid':
        return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Active</span>;
      case 'used':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center"><Clock className="w-3 h-3 mr-1" />Used</span>;
      case 'expired':
        return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center"><AlertCircle className="w-3 h-3 mr-1" />Expired</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center"><XCircle className="w-3 h-3 mr-1" />Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString, timeString) => {
    if (!dateString) return '-';
    
    if (timeString) {
      return timeString;
    }
    
    // Extract time from date object if no specific time string provided
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatShowTime = (date, startTime) => {
    if (!date) return '-';
    
    const formattedDate = formatDate(date);
    const formattedTime = startTime || formatTime(date);
    
    return `${formattedDate} at ${formattedTime}`;
  };

  const filteredTickets = activeFilter === "all" 
    ? tickets 
    : tickets.filter(ticket => ticket.status === activeFilter);

  // Calculate counts for each status to show in filter tabs
  const statusCounts = tickets.reduce((counts, ticket) => {
    const status = ticket.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  const activeCount = (statusCounts.active || 0) + (statusCounts.valid || 0);
  const usedCount = statusCounts.used || 0;
  const allCount = tickets.length;

  if (loading) return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6 mx-auto"></div>
        <div className="flex justify-center space-x-4 mb-8">
          <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-3 w-3/4">
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-1/4 flex flex-col items-end">
                  <div className="h-6 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Unable to Load Tickets</h2>
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center justify-center">
          <Ticket className="w-7 h-7 mr-2 text-indigo-600" />
          My Tickets
        </h1>
        
        {/* Filter tabs with counts */}
        <div className="inline-flex rounded-lg shadow-sm p-1 bg-gray-100 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all flex items-center ${
              activeFilter === "all" 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
            <span className="ml-1.5 inline-flex items-center justify-center bg-gray-200 text-gray-700 rounded-full w-6 h-6 text-xs">
              {allCount}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all flex items-center ${
              activeFilter === "active" 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Active
            <span className="ml-1.5 inline-flex items-center justify-center bg-green-100 text-green-700 rounded-full w-6 h-6 text-xs">
              {activeCount}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("used")}
            className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all flex items-center ${
              activeFilter === "used" 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Used
            <span className="ml-1.5 inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 text-xs">
              {usedCount}
            </span>
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <AnimatePresence>
          {filteredTickets.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Ticket className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
              <p className="text-gray-500">
                {activeFilter === "all" 
                  ? "You haven't booked any tickets yet." 
                  : `You don't have any ${activeFilter} tickets.`}
              </p>
            </motion.div>
          ) : (
            filteredTickets.map((ticket, index) => (
              <motion.div 
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                  ticket.status === 'active' || ticket.status === 'valid' 
                    ? 'border-green-200' 
                    : ticket.status === 'used' 
                      ? 'border-blue-200' 
                      : ticket.status === 'cancelled' 
                        ? 'border-red-200' 
                        : 'border-gray-200'
                }`}
              >
                {/* Ticket header */}
                <div 
                  className={`p-5 cursor-pointer ${
                    expandedTicket === ticket._id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => toggleTicketExpand(ticket._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-semibold line-clamp-1">{ticket.event?.title || 'Event'}</h2>
                        {getStatusBadge(ticket.status)}
                      </div>
                      
                      <div className="text-gray-600 flex items-center text-sm">
                        <CalendarIcon className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                        <span>{formatShowTime(ticket.event?.startDate, ticket.showTime)}</span>
                      </div>
                      
                      <div className="text-gray-600 flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                        <span className="line-clamp-1">{ticket.event?.venue || 'Venue not specified'}</span>
                      </div>

                      <div className="text-gray-600 flex items-center text-sm">
                        <Users className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                        <span>{ticket.headCount} {ticket.headCount > 1 ? 'tickets' : 'ticket'}</span>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 mt-2 sm:mt-0">
                      <div className="text-indigo-600 font-semibold flex items-center">
                        <CreditCard className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span>₹{ticket.totalAmount?.toLocaleString() || '-'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> 
                        <span>{formatDate(ticket.purchaseDate || ticket.createdAt).split(',')[0]}</span>
                      </div>
                      
                      <div className="sm:hidden ml-auto">
                        {expandedTicket === ticket._id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded ticket details */}
                <AnimatePresence>
                  {expandedTicket === ticket._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      <div className="p-6 pt-4 bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* QR code */}
                          <div className="flex flex-col items-center justify-center md:w-1/3">
                            {ticket.qrCode ? (
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3">
                                <img 
                                  src={ticket.qrCode} 
                                  alt="Ticket QR Code" 
                                  className="w-48 h-48 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center w-48 h-48 mb-3">
                                <AlertCircle className="w-10 h-10 text-gray-400" />
                              </div>
                            )}
                            <p className="text-xs text-center text-gray-500 mb-3">
                              Present this QR code for entry
                            </p>
                            <div className="flex space-x-2">
                              {ticket.qrCode && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadQrCode(ticket.qrCode, ticket.ticketNumber);
                                  }}
                                  className="flex items-center"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Save
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shareTicket(ticket);
                                }}
                                className="flex items-center"
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                          
                          {/* Ticket details */}
                          <div className="md:w-2/3 md:pl-4 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0">
                            <h3 className="font-medium text-gray-900 mb-3">Ticket Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ticket Number</div>
                                <div className="font-mono text-sm mt-1">{ticket.ticketNumber || '-'}</div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Purchase Date</div>
                                <div className="mt-1">{formatDate(ticket.purchaseDate || ticket.createdAt)}</div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Event Date</div>
                                <div className="mt-1">{formatDate(ticket.event?.startDate)}</div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Show Time</div>
                                <div className="mt-1">{ticket.showTime || formatTime(ticket.event?.startDate) || '-'}</div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Number of Tickets</div>
                                <div className="mt-1">{ticket.headCount || 1}</div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                                <div className="mt-1">{getStatusBadge(ticket.status)}</div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Status</div>
                                <div className="mt-1">{ticket.paymentStatus === 'completed' || ticket.paymentStatus === 'paid' ? (
                                  <span className="text-green-600 flex items-center text-sm">
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />Paid
                                  </span>
                                ) : (
                                  <span className="text-yellow-600 flex items-center text-sm">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" />{ticket.paymentStatus}
                                  </span>
                                )}</div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount Paid</div>
                                <div className="font-medium mt-1">₹{ticket.totalAmount?.toLocaleString() || '-'}</div>
                              </div>
                            </div>
                            
                            {/* Status-specific messages */}
                            {(ticket.status === 'active' || ticket.status === 'valid') && (
                              <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-100">
                                <div className="flex items-start">
                                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-green-800">Ticket is valid for entry</h4>
                                    <p className="text-sm text-green-600 mt-1">
                                      Present this QR code to the staff for scanning at the venue entry.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {ticket.status === 'used' && (
                              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="flex items-start">
                                  <Clock className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-blue-800">Ticket has been used</h4>
                                    <p className="text-sm text-blue-600 mt-1">
                                      This ticket has already been scanned for entry.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {ticket.status === 'cancelled' && (
                              <div className="mt-6 bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="flex items-start">
                                  <XCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-red-800">Ticket has been cancelled</h4>
                                    <p className="text-sm text-red-600 mt-1">
                                      This ticket is no longer valid for entry.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {ticket.status === 'expired' && (
                              <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                                <div className="flex items-start">
                                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-yellow-800">Ticket has expired</h4>
                                    <p className="text-sm text-yellow-600 mt-1">
                                      This ticket is no longer valid as the event date has passed.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}