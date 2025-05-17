'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QRScanner } from '@/components/scanner/QRScanner';
import { TicketVerification } from '@/components/scanner/TicketVerification';
import { Camera, Ticket, FileDigit, Check, X, User } from 'lucide-react';

export default function ScanTicketsPage() {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [animateVerification, setAnimateVerification] = useState(false);
  const [processingEvent, setProcessingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const resultRef = useRef(null);

  // Sound references
  const successSoundRef = '/sounds/yay.mp3';
  const alertSoundRef = '/sounds/alert.mp3';

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
      const response = await api.post('/tickets/verify', { qrData, eventId: selectedEvent });
      
      // Set verification result with user and their event tickets
      setScanResult({
        status: 'success',
        user: response.data.user,
        tickets: response.data.tickets || []
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
                      ${animateVerification ? 'animate-pulse' : ''}`}>
        {/* User Info Panel */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="opacity-80 mt-1">{user.email}</p>
              {user.phoneNumber && (
                <p className="opacity-80">{user.phoneNumber}</p>
              )}
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <User className="h-8 w-8" />
            </div>
          </div>
        </div>
        
        {/* Events List */}
        <div className="p-4">
          <h4 className="font-semibold text-lg mb-3">Event Tickets ({tickets.length})</h4>
          
          {tickets.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No event tickets found</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={`${ticket.ticketId}-${ticket.eventId}`} 
                  className={`border rounded-lg p-4 ${
                    ticket.status === 'attended' 
                      ? 'bg-green-50 border-green-200' 
                      : ticket.canVerify
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold">{ticket.eventTitle}</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(ticket.startDate)} - {formatDate(ticket.endDate)}
                      </p>
                      <p className="text-sm text-gray-600">{ticket.eventVenue}</p>
                      
                      {ticket.status === 'attended' && (
                        <div className="flex items-center mt-2 text-green-700 bg-green-100 px-2 py-1 rounded text-xs inline-block">
                          <Check size={14} className="mr-1" />
                          <span>
                            Attended {ticket.verifiedAt ? `(${formatDate(ticket.verifiedAt)})` : ''}
                          </span>
                        </div>
                      )}
                      
                      {ticket.status === 'registered' && (
                        <div className="flex items-center mt-2 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs inline-block">
                          <Ticket size={14} className="mr-1" />
                          <span>Registered</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action buttons based on verification permissions */}
                    <div>
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
                        <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                          Not assigned to this event
                        </div>
                      )}
                      
                      {!ticket.isEventActive && ticket.status === 'registered' && (
                        <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded mt-1">
                          Event not active
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-9xl mx-auto px-4 py-6 space-y-6">
      {/* Event select dropdown */}
      <div className="mb-6">
        <label className="block font-semibold mb-1 text-lg">Select Event <span className="text-red-500">*</span></label>
        <select
          className="input w-full max-w-md"
          value={selectedEvent}
          onChange={e => setSelectedEvent(e.target.value)}
        >
          <option value="">-- Select an event --</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>
              {event.title} ({new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()})
            </option>
          ))}
        </select>
      </div>
      {/* Header with animated gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-6 shadow-lg">
        <div
          className="absolute top-0 left-0 w-full h-full bg-white opacity-10 background-animate"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'slide 20s linear infinite'
          }}
        ></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold flex items-center">
            <Ticket className="mr-3" size={30} />
            Event Ticket Scanner
          </h1>
          <p className="mt-2 opacity-90">
            Verify event tickets securely and efficiently with instant feedback.
          </p>
        </div>
      </div>

      {/* Staff Instructions */}
      <Alert className="bg-blue-50 text-blue-800 border-blue-200 rounded-xl shadow-md">
        <AlertTitle className="text-lg font-bold flex items-center">
          <FileDigit className="mr-2" size={20} /> Staff Instructions
        </AlertTitle>
        <AlertDescription className="mt-2">
          <ol className="list-decimal pl-5 space-y-1">
            <li>Scan any ticket QR code or enter the ticket number manually</li>
            <li>Valid tickets will show a green "Mark as Used" button</li>
            <li>Only mark tickets as used after confirming attendee identity</li>
            <li>Invalid or already used tickets will be clearly highlighted</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Main content area with responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - scanning options */}
        <div>
          {/* Switch between camera and manual entry */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="flex border-b">
              <button
                onClick={() => toggleScanMode('camera')}
                className={`flex-1 py-3 px-4 font-medium text-center transition-colors flex items-center justify-center
                          ${scanMode === 'camera' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                disabled={!selectedEvent}
              >
                <Camera size={18} className="mr-2" />
                Scan QR Code
              </button>
              <button
                onClick={() => toggleScanMode('manual')}
                className={`flex-1 py-3 px-4 font-medium text-center transition-colors flex items-center justify-center
                          ${scanMode === 'manual' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                disabled={!selectedEvent}
              >
                <FileDigit size={18} className="mr-2" />
                Manual Entry
              </button>
            </div>

            <div className="p-6">
              {!selectedEvent ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg">Please select an event to start scanning tickets.</p>
                </div>
              ) : scanMode === 'camera' ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Scan Ticket QR Code</h2>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <QRScanner onScan={handleVerify} onError={handleError} />
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-3">
                    Position the QR code within the scanner frame
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Enter Ticket Code</h2>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Enter ticket code"
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
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Ticket className="mr-2" size={20} />
                Ticket Verification Results
              </h2>

              <div className="min-h-52">
                {renderScanResults()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar at bottom with latest scan result */}
      {scanResult && (
        <div className={`fixed bottom-0 left-0 right-0 px-4 py-3 text-white text-center transform transition-transform duration-500 ${scanResult.status === 'success' ? 'bg-blue-600' : 'bg-red-600'}`}>
          <div className="max-w-6xl mx-auto flex items-center justify-center">
            {scanResult.status === 'success' ? (
              <User size={20} className="mr-2" />
            ) : (
              <X size={20} className="mr-2" />
            )}
            <span className="font-medium">
              {scanResult.status === 'success' 
                ? `User verified: ${scanResult.user.name} with ${scanResult.tickets.length} ticket(s)` 
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
      `}</style>
    </div>
  );
}