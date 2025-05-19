"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Ticket, Clock, MapPin, Calendar, Tag, AlertCircle, 
  CheckCircle, XCircle, Download, Share2, ChevronDown, ChevronUp 
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
        setTickets(res.data.tickets || res.data.data);
      } catch (err) {
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShowTime = (date, startTime) => {
    if (!date || !startTime) return '';
    return `${new Date(date).toLocaleDateString()} at ${startTime}`;
  };

  const filteredTickets = activeFilter === "all" 
    ? tickets 
    : tickets.filter(ticket => ticket.status === activeFilter);

  if (loading) return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6 mx-auto"></div>
        <div className="flex justify-center space-x-4 mb-8">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[1, 2].map(n => (
            <div key={n} className="bg-white rounded-xl shadow p-6 border border-gray-100 animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-40 bg-gray-200 rounded mb-3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 max-w-4xl mx-auto">
      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
      <h2 className="text-xl font-bold mb-2">Error Loading Tickets</h2>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center justify-center">
          <Ticket className="w-6 h-6 mr-2 text-indigo-600" />
          My Tickets
        </h1>
        
        {/* Filter tabs */}
        <div className="inline-flex rounded-md shadow-sm p-1 bg-gray-100 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeFilter === "all" 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeFilter === "active" 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter("used")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeFilter === "used" 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Used
          </button>
        </div>
      </div>

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
                className="bg-white rounded-xl shadow overflow-hidden border border-gray-200"
              >
                {/* Ticket header */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleTicketExpand(ticket._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-semibold">{ticket.event?.title || 'Event'}</h2>
                        {getStatusBadge(ticket.status)}
                      </div>
                      
                      <div className="text-gray-600 flex items-center text-sm mb-1">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span>{formatShowTime(
                          ticket.event?.startDate, 
                          ticket.showTime || ticket.event?.startTime
                        )}</span>
                      </div>
                      
                      <div className="text-gray-600 flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span>{ticket.event?.venue || 'Venue'}</span>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1">
                      <div className="text-indigo-600 font-semibold flex items-center">
                        <Tag className="w-4 h-4 mr-1.5" />
                        <span>₹{ticket.totalAmount?.toLocaleString() || '-'}</span>
                      </div>
                      
                      <div className="text-gray-500 text-sm">
                        {ticket.headCount > 1 ? `${ticket.headCount} tickets` : '1 ticket'}
                      </div>
                      
                      <div className="sm:hidden">
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
                      <div className="p-6 pt-4 bg-indigo-50 bg-opacity-50">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-500">Ticket Number</div>
                                <div className="font-mono text-sm">{ticket.ticketNumber || '-'}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-gray-500">Purchase Date</div>
                                <div>{formatDate(ticket.purchaseDate || ticket.createdAt)}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-gray-500">Show Date</div>
                                <div>{formatDate(ticket.event?.startDate)}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-gray-500">Show Time</div>
                                <div>{ticket.showTime || ticket.event?.startTime || '-'}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-gray-500">Head Count</div>
                                <div>{ticket.headCount || 1}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-gray-500">Status</div>
                                <div>{getStatusBadge(ticket.status)}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-gray-500">Payment Status</div>
                                <div>{ticket.paymentStatus === 'completed' ? (
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
                                <div className="text-sm text-gray-500">Amount Paid</div>
                                <div className="font-medium">₹{ticket.totalAmount?.toLocaleString() || '-'}</div>
                              </div>
                            </div>
                            
                            {ticket.status === 'active' && (
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