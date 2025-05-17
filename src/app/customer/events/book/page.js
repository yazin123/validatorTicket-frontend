"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function MultiEventBookPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await api.get("/events?status=published");
        const eventData = res.data.events || res.data.data || res.data;
        setEvents(eventData);
        
        // Check for pre-selected event from URL
        const preSelectedEvent = searchParams.get('eventId');
        if (preSelectedEvent) {
          setSelectedEvents([preSelectedEvent]);
        }
      } catch (err) {
        setError("Failed to load events");
      }
    }
    fetchEvents();
  }, [searchParams]);

  // Calculate total price whenever events or quantity changes
  useEffect(() => {
    if (events.length > 0 && selectedEvents.length > 0) {
      const selectedEventObjects = events.filter(event => 
        selectedEvents.includes(event._id)
      );
      
      const price = selectedEventObjects.reduce(
        (sum, event) => sum + (event.price * quantity), 
        0
      );
      
      setTotalPrice(price);
    } else {
      setTotalPrice(0);
    }
  }, [events, selectedEvents, quantity]);

  const handleEventSelect = (eventId) => {
    setSelectedEvents(prev => prev.includes(eventId)
      ? prev.filter(id => id !== eventId)
      : [...prev, eventId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedEvents.length === 0) {
      setError("Please select at least one event.");
      return;
    }
    if (quantity < 1) {
      setError("Please enter a valid quantity.");
      return;
    }
    
    // Show payment confirmation step
    setShowPayment(true);
  };
  
  const handleCompletePayment = async () => {
    setLoading(true);
    setError("");
    try {
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPaymentSuccess(true);
      
      // Proceed with ticket booking
      const res = await api.post(`/tickets/book`, {
        events: selectedEvents,
        quantity
      });
      
      toast.success("Ticket(s) booked successfully!");
      setQrCode(res.data.qrCode || res.data.data?.qrCode);
    } catch (err) {
      setPaymentSuccess(false);
      setShowPayment(false);
      setError(err?.response?.data?.message || "Failed to book ticket(s)");
    } finally {
      setLoading(false);
    }
  };

  if (qrCode) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking Successful!</h1>
        <p className="mb-4">Show this QR code at the event venue for entry.</p>
        <div className="flex justify-center mb-4">
          <img src={qrCode} alt="Your Ticket QR Code" className="w-48 h-48 object-contain border rounded-lg" />
        </div>
        <Button className="w-full" onClick={() => window.location.href = '/customer/tickets'}>Go to My Tickets</Button>
      </div>
    );
  }
  
  if (showPayment) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Complete Payment</h1>
        <div className="border-t border-b py-4 my-4">
          <div className="flex justify-between mb-2">
            <span>Selected Events:</span>
            <span>{selectedEvents.length}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Quantity:</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Simulated payment form */}
        <div className="my-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-sm text-gray-500 mb-4">This is a simulated payment gateway for testing purposes.</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Card Number" className="input" defaultValue="4242 4242 4242 4242" disabled />
            <input type="text" placeholder="Name on Card" className="input" defaultValue="Test User" disabled />
            <input type="text" placeholder="MM/YY" className="input" defaultValue="12/25" disabled />
            <input type="text" placeholder="CVV" className="input" defaultValue="123" disabled />
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={handleCompletePayment}
            loading={loading}
            disabled={loading}
          >
            Pay ₹{totalPrice.toFixed(2)}
          </Button>
          
          <button 
            className="w-full mt-2 text-gray-500 underline"
            onClick={() => setShowPayment(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Book Tickets for Events</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Select Events</label>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
            {events.map(event => {
              // Calculate remaining seats
              const remainingSeats = event.capacity - (event.ticketsSold || 0);
              
              return (
                <label key={event._id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event._id)}
                    onChange={() => handleEventSelect(event._id)}
                    className="accent-blue-600"
                    disabled={remainingSeats < quantity}
                  />
                  <div className="flex-1">
                    <div>{event.title} - ₹{event.price}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()} | Available: {remainingSeats} seat(s)
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Number of Tickets</label>
          <input
            type="number"
            min={1}
            max={200}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="input w-full"
            required
          />
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        {error && <div className="text-red-600 text-center font-semibold py-2 bg-red-50 rounded">{error}</div>}
        <Button 
          type="submit" 
          disabled={loading || selectedEvents.length === 0} 
          className="w-full"
        >
          Proceed to Payment
        </Button>
      </form>
    </div>
  );
} 