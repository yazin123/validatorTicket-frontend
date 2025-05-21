import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  TicketIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

export function TicketVerification({ ticket, status, message, onMarkAsUsed }) {
  const [showDetails, setShowDetails] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  
  // Helper function to safely render object values
  const renderValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  };

  // Helper function to check if a string is a valid data URL
  const isValidDataURL = (str) => {
    return typeof str === 'string' && str.startsWith('data:');
  };
  
  // Process QR code for display - handles various formats
  const processQrCodeForDisplay = (qrCodeData) => {
    if (!qrCodeData) return null;
    
    // If it's already a valid data URL for an image, use it directly
    if (isValidDataURL(qrCodeData)) {
      return qrCodeData;
    }
    
    // For other formats (JSON string, plain text), create a QR code on the fly
    try {
      // For non-string data, stringify it
      const qrValue = typeof qrCodeData === 'object' 
        ? JSON.stringify(qrCodeData) 
        : String(qrCodeData);
        
      // Return component that generates QR code
      return <QRCodeSVG value={qrValue} size={160} />;
    } catch (error) {
      console.error("Error processing QR data for display:", error);
      return null;
    }
  };
  
  if (!ticket && !message) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Ticket Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <TicketIcon className="h-16 w-16 mb-3 text-gray-300" />
            <p>Scan a ticket QR code to verify</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const isSuccess = status === 'success'
  const isPending = !status
  const isExpired = ticket?.status === 'expired'
  const isUsed = ticket?.status === 'used'
  const isValid = ticket?.status === 'valid'
  const isCancelled = ticket?.status === 'cancelled'
  
  const getStatusColor = () => {
    if (isSuccess && isValid) return 'text-green-500'
    if (isSuccess && isUsed) return 'text-amber-500'
    if (isSuccess && isExpired) return 'text-red-500'
    if (isSuccess && isCancelled) return 'text-red-500'
    return 'text-red-500'
  }
  
  const getStatusIcon = () => {
    if (isSuccess && isValid) return <CheckCircleIcon className="h-6 w-6 text-green-500" />
    if (isSuccess && isUsed) return <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
    if (isSuccess && isExpired) return <XCircleIcon className="h-6 w-6 text-red-500" />
    if (isSuccess && isCancelled) return <XCircleIcon className="h-6 w-6 text-red-500" />
    return <XCircleIcon className="h-6 w-6 text-red-500" />
  }
  
  const getStatusMessage = () => {
    if (isSuccess && isValid) return 'Valid ticket'
    if (isSuccess && isUsed) return 'Ticket already used'
    if (isSuccess && isExpired) return 'Ticket expired'
    if (isSuccess && isCancelled) return 'Ticket cancelled'
    return message || 'Invalid ticket'
  }
  
  const getDetailedStatus = () => {
    if (isSuccess && isValid) {
      return (
        <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4">
          <p className="flex items-center font-medium">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Ticket is valid and can be used
          </p>
        </div>
      )
    }
    
    if (isSuccess && isUsed) {
      return (
        <div className="bg-amber-50 text-amber-800 p-3 rounded-md mb-4">
          <p className="flex items-center font-medium">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            This ticket has already been used
          </p>
          {ticket.usedAt && (
            <p className="text-sm mt-1">
              Used on: {format(new Date(ticket.usedAt), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>
      )
    }
    
    if (isSuccess && isExpired) {
      return (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
          <p className="flex items-center font-medium">
            <XCircleIcon className="h-5 w-5 mr-2" />
            This ticket has expired
          </p>
          {ticket.expiresAt && (
            <p className="text-sm mt-1">
              Expired on: {format(new Date(ticket.expiresAt), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      )
    }
    
    if (isSuccess && isCancelled) {
      return (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
          <p className="flex items-center font-medium">
            <XCircleIcon className="h-5 w-5 mr-2" />
            This ticket has been cancelled
          </p>
        </div>
      )
    }
    
    return (
      <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
        <p className="flex items-center font-medium">
          <XCircleIcon className="h-5 w-5 mr-2" />
          {message || 'Invalid ticket'}
        </p>
      </div>
    )
  }

  const handleMarkAsUsed = async () => {
    if (!ticket?._id) return;
    
    try {
      setIsMarking(true);
      await api.post(`/tickets/${ticket._id}/mark-used`);
      toast.success('Ticket successfully marked as used');
      
      // Call the callback to refresh ticket data
      if (onMarkAsUsed) {
        onMarkAsUsed(ticket._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark ticket as used');
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>Ticket Verification</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ticket ? (
          <div className="space-y-4">
            {getDetailedStatus()}
            
            <div className="flex justify-center mb-4">
              {ticket.qrCode ? (
                <>
                  {isValidDataURL(ticket.qrCode) ? (
                    <img 
                      src={ticket.qrCode} 
                      alt="Ticket QR Code" 
                      className="w-40 h-40 object-contain border border-gray-200 rounded-md"
                    />
                  ) : (
                    <QRCodeSVG 
                      value={typeof ticket.qrCode === 'object' ? JSON.stringify(ticket.qrCode) : String(ticket.qrCode)} 
                      size={160} 
                    />
                  )}
                </>
              ) : (
                <div className="bg-gray-100 h-40 w-40 flex items-center justify-center rounded-md">
                  <TicketIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Ticket Details Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-900">Ticket Details</h4>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-500 flex items-start">
                  <TicketIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  Ticket #{ticket.ticketNumber || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 flex items-start">
                  <UserIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  {ticket.attendees?.length || 0} {ticket.attendees?.length === 1 ? 'Attendee' : 'Attendees'}
                </p>
                <p className={`text-sm flex items-start ${getStatusColor()}`}>
                  Status: <span className="font-medium ml-1">{ticket.status || 'Unknown'}</span>
                </p>
                {ticket.paymentStatus && (
                  <p className="text-sm text-gray-500 flex items-start">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Payment: <span className="ml-1">{renderValue(ticket.paymentStatus)}</span>
                  </p>
                )}
                {ticket.purchaseDate && (
                  <p className="text-sm text-gray-500 flex items-start">
                    <CalendarIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Purchased: {format(new Date(ticket.purchaseDate), 'MMM d, yyyy')}
                  </p>
                )}
                {ticket.totalAmount && (
                  <p className="text-sm text-gray-500 flex items-start">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Amount: ${typeof ticket.totalAmount === 'number' ? ticket.totalAmount.toFixed(2) : 'N/A'}
                  </p>
                )}
              </div>
            </div>

          

            {/* Events Section */}
            {ticket.events && ticket.events.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Events</h4>
                <div className="mt-1 space-y-3">
                  {ticket.events.map((eventItem, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">
                        {eventItem.event?.name ? renderValue(eventItem.event.name) : 'Event'}
                      </p>
                      <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-gray-500">
                        {eventItem.event?.startTime && (
                          <p className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {renderValue(eventItem.event.startTime)}
                            {eventItem.event?.endTime && ` - ${renderValue(eventItem.event.endTime)}`}
                          </p>
                        )}
                        {eventItem.event?.location && (
                          <p className="flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {typeof eventItem.event.location === 'object' 
                              ? (eventItem.event.location.name || 'Location')
                              : renderValue(eventItem.event.location)
                            }
                          </p>
                        )}
                        <p className={`flex items-center ${eventItem.verified ? 'text-green-600' : 'text-gray-500'}`}>
                          {eventItem.verified ? (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-3 w-3 mr-1" />
                              Not Verified
                            </>
                          )}
                        </p>
                        {eventItem.verifiedAt && (
                          <p>
                            Verified: {format(new Date(eventItem.verifiedAt), 'MMM d')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchaser Info Section */}
            {ticket.purchasedBy && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Purchased By</h4>
                <div className="mt-1 bg-gray-50 p-2 rounded-md">
                  <p className="text-sm font-medium">
                    {typeof ticket.purchasedBy === 'object' ? ticket.purchasedBy.name : 'User'}
                  </p>
                  <div className="mt-1 space-y-1 text-xs text-gray-500">
                    {ticket.purchasedBy?.email && (
                      <p className="flex items-center">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                        {renderValue(ticket.purchasedBy.email)}
                      </p>
                    )}
                    {ticket.purchasedBy?.phoneNumber && (
                      <p className="flex items-center">
                        <PhoneIcon className="h-3 w-3 mr-1" />
                        {renderValue(ticket.purchasedBy.phoneNumber)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attendees Section */}
            {ticket.attendees && ticket.attendees.length > 0 && (
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-900">Attendees</h4>
                  {ticket.attendees.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? 'Hide' : 'Show All'}
                    </Button>
                  )}
                </div>
                <ul className="mt-1 space-y-2">
                  {(showDetails ? ticket.attendees : ticket.attendees.slice(0, 2)).map((attendee, index) => (
                    <li key={index} className="text-sm bg-gray-50 p-2 rounded-md">
                      <p className="font-medium">{typeof attendee === 'object' ? renderValue(attendee.name) : 'Attendee'}</p>
                      <div className="text-gray-500 text-xs mt-1">
                        {attendee?.email && <p>Email: {renderValue(attendee.email)}</p>}
                        {attendee?.phone && <p>Phone: {renderValue(attendee.phone)}</p>}
                      </div>
                    </li>
                  ))}
                  {!showDetails && ticket.attendees.length > 2 && (
                    <li className="text-xs text-gray-500">
                      +{ticket.attendees.length - 2} more attendees
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Mark as Used Button - only show for admin/staff and valid tickets */}
            {isSuccess && isValid && (
              <div className="mt-4">
                <Button 
                  onClick={handleMarkAsUsed}
                  disabled={isMarking}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isMarking ? 'Processing...' : 'Mark Ticket as Used'}
                </Button>
                <p className="text-xs text-center mt-2 text-gray-500">
                  Only staff or admin can mark tickets as used
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">
            {message || 'No ticket data available'}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 