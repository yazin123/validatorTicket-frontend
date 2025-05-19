'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QRScanner } from '@/components/scanner/QRScanner';
import { TicketVerification } from '@/components/scanner/TicketVerification';
import { Camera, Ticket, FileDigit, Check, X, User, CalendarIcon } from 'lucide-react';

export default function ScanTicketsPage() {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [animateVerification, setAnimateVerification] = useState(false);
  const [processingEvent, setProcessingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const resultRef = useRef(null);

  // Sound references
  const successSoundRef = '/sounds/yay.mp3';
  const alertSoundRef = '/sounds/alert.mp3';

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Play sound based on type
  const playSound = (soundType) => {
    try {
      const soundSrc = soundType === 'success' ? successSoundRef : alertSoundRef;
      const audio = new Audio(soundSrc);
      audio.play().catch(e => console.log('Audio play error:', e));
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await api.get('/admin/events?page=1&limit=100');
        setEvents(res.data.events.filter(e => e.status === 'published'));
      } catch (err) {
        setEvents([]);
      }
    }
    fetchEvents();
  }, []);

  // Scroll to results when verification is completed
  useEffect(() => {
    if (scanResult && resultRef.current) {
      // Add animation class
      setAnimateVerification(true);

      // On mobile, scroll to the results
      if (window.innerWidth < 768) {
        resultRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      // Remove animation class after animation completes
      const timer = setTimeout(() => setAnimateVerification(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  // This function is called when a QR code is scanned or manual code is submitted
  const handleVerify = async (qrData) => {
    if (!selectedEvent) {
      toast.error('Please select an event first.');
      return;
    }
    try {
      setLoading(true);
      setScanResult(null);
      
      // Process the QR code data - any format should now work with our improved endpoint
      let processedQrData = qrData;
      
      if (typeof qrData === 'string') {
        // For string types, just pass as-is, backend will handle all formats:
        // - Data URLs
        // - JSON strings
        // - Ticket numbers
        // - Pipe-delimited strings
        console.log('Processing string QR data');
      } else {
        // If it's an object, we'll pass it as-is
        console.log('Processing object QR data');
      }
      
      console.log('Verifying ticket');
      
      // Send the data to the API
      const response = await api.post('/tickets/verify', { 
        qrData: processedQrData, 
        eventId: selectedEvent 
      });

      // Additional data needed for complete ticket info
      let tickets = response.data.tickets || [];
      
      // For each ticket, fetch additional details if they're not already provided
      if (tickets.length > 0) {
        // Use Promise.all to fetch all ticket details in parallel
        tickets = await Promise.all(tickets.map(async (ticket) => {
          // If we already have complete ticket info, use it
          if (ticket.headCount && ticket.totalAmount && ticket.paymentStatus) {
            return ticket;
          }
          
          // Otherwise, try to fetch more details
          try {
            const detailsResponse = await api.get(`/tickets/${ticket.ticketId}`);
            const fullTicket = detailsResponse.data.data;
            
            // Merge the ticket info with the verification info
            return {
              ...ticket,
              headCount: fullTicket.headCount || 1,
              totalAmount: fullTicket.totalAmount,
              paymentStatus: fullTicket.paymentStatus,
              purchaseDate: fullTicket.purchaseDate
            };
          } catch (err) {
            console.log('Could not fetch additional ticket details:', err);
            return ticket;
          }
        }));
      }

      // Set verification result with user and their enhanced ticket info
      setScanResult({
        status: 'success',
        user: response.data.user,
        tickets: tickets
      });

      // Play success sound
      playSound('success');
      toast.success('User QR code verified successfully');
    } catch (error) {
      console.error('Verification error:', error);

      // Play alert sound for errors
      playSound('alert');

      setScanResult({
        status: 'error',
        message: error.response?.data?.message || 'Failed to verify QR code'
      });
      toast.error(error.response?.data?.message || 'Failed to verify QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
    toast.error('Error scanning QR code');
  };

  const handleMarkAttended = async (ticketId, eventId) => {
    try {
      setProcessingEvent(eventId);

      // Call API to mark event as attended
      const response = await api.post('/tickets/mark-attended', {
        ticketId,
        eventId
      });

      // Update the local state to reflect the change
      setScanResult(prev => {
        if (!prev || !prev.tickets) return prev;

        return {
          ...prev,
          tickets: prev.tickets.map(ticket => {
            if (ticket.eventId === eventId && ticket.ticketId === ticketId) {
              return {
                ...ticket,
                status: 'attended',
                verifiedAt: new Date(),
                canBeMarkedAttended: false
              };
            }
            return ticket;
          })
        };
      });

      // Success notification
      toast.success('Attendance marked successfully');
      playSound('success');

      // Visual celebration animation
      setAnimateVerification(true);
      setTimeout(() => setAnimateVerification(false), 1000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
      playSound('alert');
    } finally {
      setProcessingEvent(null);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleVerify(manualCode.trim());
      setManualCode('');
    }
  };

  // Format date to display in a user-friendly way
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Toggle between camera and manual entry
  const toggleScanMode = (mode) => {
    setScanMode(mode);
  };

  // Render the scan results
  const renderScanResults = () => {
    if (!scanResult) return null;

    if (scanResult.status === 'error') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <X className="mr-2 text-red-500" size={24} />
            <h3 className="text-lg font-semibold">Verification Failed</h3>
          </div>
          <p>{scanResult.message}</p>
        </div>
      );
    }

    const { user, tickets } = scanResult;

    return (
      <div className={`bg-white border rounded-xl shadow-md overflow-hidden 
                      ${animateVerification ? 'animate-pulse' : ''} print:shadow-none print:border-none`}>
        {/* Printer Header - only visible when printing */}
        <div className="hidden print:block text-center p-6 bg-gray-50">
          <h2 className="text-xl font-bold">Event Verification Receipt</h2>
          <p className="text-sm text-gray-600">Generated {new Date().toLocaleString()}</p>
        </div>
        
        {/* User Info Panel */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 print:bg-white print:text-black print:border-b-2 print:border-gray-400">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <div className="mt-1 space-y-1">
                <p className="opacity-80 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user.email}
                </p>
                {user.phoneNumber && (
                  <p className="opacity-80 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {user.phoneNumber}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-full print:hidden">
              <User className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="p-4">
          <h4 className="font-semibold text-lg mb-3 flex items-center">
            <Ticket className="mr-2" size={20} />
            Event Tickets ({tickets.length})
          </h4>

          {tickets.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No event tickets found</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={`${ticket.ticketId}-${ticket.eventId}`}
                  className={`border rounded-lg p-4 ${ticket.status === 'attended'
                      ? 'bg-green-50 border-green-200'
                      : ticket.canVerify
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                    } print:break-inside-avoid print:border-none print:p-4`}
                >
                  {/* Professional Ticket Header */}
                  <div className="border-b pb-3 mb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <h5 className="font-bold text-lg">{ticket.eventTitle}</h5>
                      <div className="mt-1 sm:mt-0">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium
                          ${ticket.status === 'attended' ? 'bg-green-100 text-green-800' : 
                            ticket.status === 'active' || ticket.status === 'registered' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 font-mono">{ticket.ticketId}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* Left Column - Ticket Details */}
                    <div className="space-y-4 flex-1">
                      {/* Event Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Date & Time */}
                        <div className="flex items-start">
                          <CalendarIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500 print:text-black" />
                          <div>
                            <p className="font-medium">Date & Time</p>
                            <p>{formatDate(ticket.startDate)}</p>
                            <p>to {formatDate(ticket.endDate)}</p>
                          </div>
                        </div>
                        
                        {/* Venue */}
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <p className="font-medium">Venue</p>
                            <p>{ticket.eventVenue || 'Not specified'}</p>
                          </div>
                        </div>
                        
                        {/* Headcount */}
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <p className="font-medium">Number of Attendees</p>
                            <p>{ticket.headCount || 1} {ticket.headCount > 1 ? 'persons' : 'person'}</p>
                          </div>
                        </div>
                        
                        {/* Payment */}
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-medium">Payment</p>
                            <p className="flex items-center">
                              <span>{ticket.totalAmount ? `$${ticket.totalAmount.toFixed(2)}` : 'N/A'}</span>
                              {ticket.paymentStatus && (
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full
                                  ${ticket.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                                    ticket.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-gray-100 text-gray-800'}`}>
                                  {ticket.paymentStatus}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Verification Info */}
                      {ticket.verifiedAt && (
                        <div className="border-t pt-3 mt-2">
                          <p className="text-sm flex items-center text-gray-500">
                            <Check size={14} className="mr-1 text-green-500" />
                            Verified on {formatDate(ticket.verifiedAt)} 
                            {ticket.verifiedBy && ` by ${ticket.verifiedBy}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Action buttons and Status */}
                    <div className="print:hidden flex flex-col justify-center mt-3 sm:mt-0 sm:w-40">
                      {ticket.canBeMarkedAttended && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                          onClick={() => handleMarkAttended(ticket.ticketId, ticket.eventId)}
                          disabled={processingEvent === ticket.eventId}
                        >
                          {processingEvent === ticket.eventId ? (
                            <span className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-r-transparent rounded-full"></div>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Check size={16} className="mr-1" />
                              Mark Attended
                            </span>
                          )}
                        </Button>
                      )}

                      {!ticket.canVerify && ticket.status === 'registered' && (
                        <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded text-center">
                          Not assigned to this event
                        </div>
                      )}
                      
                      {!ticket.isEventActive && (
                        <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded text-center mt-2">
                          Event not active
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Print-only verification signature section */}
                  <div className="hidden print:block mt-8 pt-4 border-t border-dashed">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Verified by (Name & Signature)</p>
                        <div className="mt-4 border-b border-gray-400 w-48">&nbsp;</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <div className="mt-4 border-b border-gray-400 w-48">&nbsp;</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Print-only footer with terms */}
        <div className="hidden print:block p-4 border-t text-xs text-gray-500 text-center">
          <p>This verification receipt confirms the ticket holder's attendance at the event.</p>
          <p>For any inquiries, please contact the event organizer.</p>
          <p className="mt-2">{window.location.hostname} • {new Date().toLocaleString()}</p>
        </div>
        
        {/* Print button - only visible on screen */}
        <div className="p-4 border-t flex justify-end print:hidden">
          <Button
            onClick={() => window.print()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            size="sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Ticket Receipt
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-9xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Event select dropdown - fixed at top on mobile */}
      <div className="sticky top-0 z-10 bg-white px-2 py-3 mb-3 sm:mb-6 border-b border-gray-200 sm:border-none sm:static sm:bg-transparent sm:p-0">
        <label className="block font-semibold mb-1 text-base sm:text-lg">Select Event <span className="text-red-500">*</span></label>
        <select
          className="input w-full max-w-md text-sm sm:text-base p-2 border border-gray-300 rounded-lg"
          value={selectedEvent}
          onChange={e => setSelectedEvent(e.target.value)}
        >
          <option value="">-- Select an event --</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>
              {event.title} ({new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>
      
      {/* Header with animated gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-4 sm:p-6 shadow-lg">
        <div
          className="absolute top-0 left-0 w-full h-full bg-white opacity-10 background-animate"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'slide 20s linear infinite'
          }}
        ></div>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Ticket className="mr-2 sm:mr-3" size={28} />
            Ticket Scanner
          </h1>
          <p className="mt-2 opacity-90 text-sm sm:text-base">
            Verify event tickets securely and efficiently with instant feedback.
          </p>
        </div>
      </div>

      {/* Staff Instructions - collapsible on mobile */}
      <div className="relative">
        <details className="sm:open" open={!isMobile}>
          <summary className="sm:hidden cursor-pointer bg-blue-50 text-blue-800 p-3 rounded-t-xl font-medium flex items-center">
            <FileDigit className="mr-2" size={18} />
            Staff Instructions
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <Alert className="bg-blue-50 text-blue-800 border-blue-200 rounded-b-xl sm:rounded-xl shadow-md">
            <div className="hidden sm:block">
              <AlertTitle className="text-lg font-bold flex items-center">
                <FileDigit className="mr-2" size={20} /> Staff Instructions
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2 text-sm">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Scan any ticket QR code or enter the ticket number manually</li>
                <li>Valid tickets will show a green "Mark as Attended" button</li>
                <li>Only mark tickets as attended after confirming identity</li>
                <li>Invalid or already used tickets will be clearly highlighted</li>
              </ol>
            </AlertDescription>
          </Alert>
        </details>
      </div>

      {/* Main content area with responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left column - scanning options */}
        <div>
          {/* Switch between camera and manual entry */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 sm:mb-6">
            <div className="flex border-b">
              <button
                onClick={() => toggleScanMode('camera')}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 font-medium text-center transition-colors flex items-center justify-center
                          ${scanMode === 'camera' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                disabled={!selectedEvent}
              >
                <Camera size={18} className="mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Scan QR</span>
              </button>
              <button
                onClick={() => toggleScanMode('manual')}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 font-medium text-center transition-colors flex items-center justify-center
                          ${scanMode === 'manual' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                disabled={!selectedEvent}
              >
                <FileDigit size={18} className="mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Manual</span>
              </button>
            </div>

            <div className="p-3 sm:p-6">
              {!selectedEvent ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-base sm:text-lg">Please select an event to start scanning tickets.</p>
                </div>
              ) : scanMode === 'camera' ? (
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Scan Ticket QR Code</h2>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <QRScanner onScan={handleVerify} onError={handleError} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Enter Ticket Code</h2>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Enter ticket code or number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                        disabled={!selectedEvent}
                      />
                      {manualCode && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setManualCode('')}
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !manualCode.trim() || !selectedEvent}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all text-white font-medium rounded-lg flex items-center justify-center"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Check size={18} className="mr-2" />
                          Verify Ticket
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - ticket verification results */}
        <div ref={resultRef}>
          <div className={`bg-white rounded-xl shadow-md overflow-hidden h-full
                        ${animateVerification ? 'animate-pulse-once border-2 border-green-400' : 'border border-gray-200'}`}>
            <div className="p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 flex items-center">
                <Ticket className="mr-2" size={20} />
                Verification Results
              </h2>

              <div className="min-h-[200px] sm:min-h-[250px]">
                {renderScanResults()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar at bottom with latest scan result */}
      {scanResult && (
        <div className={`fixed bottom-0 left-0 right-0 px-4 py-3 text-white text-center transform transition-transform duration-500 ${scanResult.status === 'success' ? 'bg-blue-600' : 'bg-red-600'} z-50`}>
          <div className="max-w-6xl mx-auto flex items-center justify-center text-sm">
            {scanResult.status === 'success' ? (
              <User size={18} className="mr-2 flex-shrink-0" />
            ) : (
              <X size={18} className="mr-2 flex-shrink-0" />
            )}
            <span className="font-medium truncate">
              {scanResult.status === 'success'
                ? `User: ${scanResult.user.name} with ${scanResult.tickets.length} ticket(s)`
                : scanResult.message}
            </span>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes slide {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }

        .background-animate {
          background-size: 60px;
        }

        @keyframes pulse-once {
          0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }

        .animate-pulse-once {
          animation: pulse-once 1s;
        }
        
        @media (max-width: 640px) {
          .input {
            font-size: 16px; /* Prevent iOS zoom */
          }
        }
      `}</style>
    </div>
  );
}