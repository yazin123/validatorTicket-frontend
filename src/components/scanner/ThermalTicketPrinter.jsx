'use client';

import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { IndianRupee } from 'lucide-react';

export const ThermalTicketPrinter = ({ ticket, user, selectedEvent, onClose }) => {
  const printRef = useRef();
  
  useEffect(() => {
    // This ensures we properly log any issues with the QR code
    if (ticket?.qrCode) {
      console.log("QR Code available:", ticket.qrCode.substring(0, 50) + "...");
    } else {
      console.log("No QR code found in ticket data");
    }
  }, [ticket]);
  
  // Format date in a compact way for the thermal receipt
  const formatCompactDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd-MM-yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Format time in a compact way
  const formatCompactTime = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm:ss');
    } catch (e) {
      return '';
    }
  };
  
  // Current time for the ticket generation timestamp
  const currentTime = format(new Date(), 'dd-MM-yyyy HH:mm:ss');
  
  // Handle print function
  const handlePrint = () => {
    const content = printRef.current;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = content.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    
    // Re-initialize React after print
    if (onClose) {
      setTimeout(onClose, 500);
    }
  };
  
  // Function to render the QR code with proper error handling
  const renderQRCode = () => {
    if (!ticket?.qrCode) {
      return (
        <div className="w-32 h-32 sm:w-40 sm:h-40 border border-dashed flex items-center justify-center text-gray-400">
          QR Code Not Available
        </div>
      );
    }
    
    return (
      <img 
        src={ticket.qrCode} 
        alt="Ticket QR Code" 
        className="w-32 h-32 sm:w-40 sm:h-40 object-contain" 
       
      />
    );
  };
  
  // Handle ticket data - support both single ticket and array of tickets
  const ticketData = Array.isArray(ticket) ? ticket[0] : ticket;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-2 sm:p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-md relative">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center shadow-md"
          aria-label="Close"
        >
          ✕
        </button>
        
        {/* Preview header */}
        <div className="bg-gray-100 rounded-t-lg p-3 sm:p-4 border-b">
          <h3 className="text-base sm:text-lg font-bold text-center">Ticket Preview</h3>
          <p className="text-xs text-center text-gray-500">This is how your printed ticket will look</p>
        </div>
        
        {/* Ticket preview */}
        <div className="p-3 sm:p-6 bg-gray-50 flex justify-center overflow-auto">
          <div 
            ref={printRef} 
            className="bg-white border w-full max-w-[80mm] font-mono text-xs leading-tight py-2"
            style={{ 
              fontFamily: 'Courier, monospace',
              fontSize: '12px'
            }}
          >
            {/* Ticket Content */}
            <div className="text-center mb-2">
              <div className="inline-block w-12 sm:w-16 h-12 sm:h-16 mb-1">
                {/* Organization logo placeholder */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="black" strokeWidth="2" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="black" strokeWidth="2" />
                  <line x1="20" y1="50" x2="80" y2="50" stroke="black" strokeWidth="2" />
                  <line x1="50" y1="20" x2="50" y2="80" stroke="black" strokeWidth="2" />
                  <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="2" />
                </svg>
              </div>
              <div className="uppercase font-bold text-xs sm:text-sm tracking-wide truncate px-2">
                {ticketData?.eventTitle || selectedEvent?.title || 'EVENT TITLE'}
              </div>
              <div className="uppercase font-bold text-xs sm:text-sm">ENTRY TICKET</div>
            </div>
            
            <div className="px-2 space-y-1">
              <div className="flex flex-wrap">
                <div className="w-20 sm:w-24">Date</div>
                <div>: {formatCompactDate(ticketData?.startDate || new Date())}</div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-20 sm:w-24">Head Count</div>
                <div>: {ticketData?.headCount || 1}</div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-20 sm:w-24">Ticket</div>
                <div>: {ticketData?.ticketnumber || ticketData?.ticketId || 'N/A'}</div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-20 sm:w-24">Amount</div>
                <div className="flex items-center">: <IndianRupee className="inline" height={12}/>{ticketData?.totalAmount || '0.00'}/-</div>
              </div>
            </div>
            
            <div className="border-t border-b border-dashed my-2 mx-2"></div>
            
            <div className="flex justify-center my-2">
              {renderQRCode()}
            </div>
            
            <div className="border-t border-b border-dashed my-2 mx-2"></div>
            
            <div className="px-2 text-center my-1">
              <div className="truncate">Scan the QR-code: {user?.name || 'Attendee'}</div>
              <div>Event {new Date().getFullYear()}</div>
            </div>
            
            <div className="border-t border-b border-dashed my-2 mx-2"></div>
            
            <div className="px-2 text-xs space-y-1 mb-4">
              <div>* Please keep ticket till exit time</div>
              <div className="break-words">* {ticketData?.eventTitle || 'Event'} remains open from {formatCompactTime(ticketData?.startDate || '')} to {formatCompactTime(ticketData?.endDate || '')}</div>
              <div>Ticket generated on: {currentTime}</div>
              <div className="text-center mt-1">Thank You For Your Visit</div>
            </div>
          </div>
        </div>
        
        {/* Print button */}
        <div className="p-3 sm:p-4 flex justify-center border-t">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:px-6 rounded-full flex items-center text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Thermal Ticket
          </button>
        </div>
      </div>
    </div>
  );
};