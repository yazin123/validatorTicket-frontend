"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import EntryPassManager from '@/components/dashboard/EntryPassManager';

export default function BookEventShowPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const eventId = params.eventId;
  const showId = searchParams.get('showId');
  
  const [event, setEvent] = useState(null);
  const [show, setShow] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [entryPass, setEntryPass] = useState(null);

  useEffect(() => {
    async function fetchEntryPass() {
      try {
        const res = await api.get('/entrypass/me');
        setEntryPass(res.data.entryPass);
      } catch {
        setEntryPass(null);
      }
    }
    fetchEntryPass();
  }, []);

  useEffect(() => {
    async function fetchEventAndShow() {
      if (!eventId || !showId) {
        setError("Missing event ID or show ID");
        return;
      }
      
      try {
        const res = await api.get(`/events/${eventId}`);
        const eventData = res.data.event || res.data.data || res.data;
        setEvent(eventData);
        
        if (eventData?.shows?.length) {
          const foundShow = eventData.shows.find(s => s.showId === showId);
          if (foundShow) {
            setShow(foundShow);
          } else {
            setError("Show not found for this event");
          }
        } else {
          setError("No shows available for this event");
        }
      } catch (err) {
        setError("Failed to load event or show");
      }
    }
    fetchEventAndShow();
  }, [eventId, showId]);

  // Calculate total price whenever event or quantity changes
  useEffect(() => {
    if (event) {
      const price = event.price * quantity;
      setTotalPrice(price);
    } else {
      setTotalPrice(0);
    }
  }, [event, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity < 1) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (quantity > maxBookable) {
      setError("Cannot book more than available seats or your entry pass head count.");
      return;
    }
    setShowPayment(true);
  };
  
  const handleCompletePayment = async () => {
    setLoading(true);
    setError("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPaymentSuccess(true);
      const res = await api.post(`/tickets/book`, {
        eventId,
        showId,
        headCount: quantity
      });
      toast.success("Ticket(s) booked successfully!");
      setQrCode(res.data.ticket?.qrCode || res.data.qrCode);
    } catch (err) {
      setPaymentSuccess(false);
      setShowPayment(false);
      setError(err?.response?.data?.message || "Failed to book ticket(s)");
    } finally {
      setLoading(false);
    }
  };

  // Prevent booking if not enough head count
  const canBook = entryPass && entryPass.headCount >= quantity;

  // Calculate available seats
  const availableSeats = event && show ? (event.capacity - (show.seatsBooked || 0)) : 0;

  // Only allow booking up to available seats and entry pass head count
  const maxBookable = Math.min(entryPass ? entryPass.headCount : 0, availableSeats);

  if (qrCode) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking Successful!</h1>
        <p className="mb-4">Show this QR code at the event venue for entry.</p>
        <div className="flex justify-center mb-4">
          <img src={qrCode} alt="Your Ticket QR Code" className="w-48 h-48 object-contain border rounded-lg" />
        </div>
        <Button className="w-full" onClick={() => router.push('/customer/tickets')}>Go to My Tickets</Button>
      </div>
    );
  }
  
  if (showPayment) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Complete Payment</h1>
        <div className="border-t border-b py-4 my-4">
          <div className="flex justify-between mb-2">
            <span>Event:</span>
            <span>{event?.title}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Show Date:</span>
            <span>{show ? new Date(show.date).toLocaleDateString() : ''}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Show Time:</span>
            <span>{show ? `${show.startTime} - ${show.endTime}` : ''}</span>
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

  // Only allow booking if event and show are loaded
  if (!event || !show) {
    return (
      <div className="p-8 text-center">
        {error ? <div className="text-red-600 text-center font-semibold py-2 bg-red-50 rounded">{error}</div> : "Loading event/show..."}
        {error && <Button className="mt-4" onClick={() => router.push('/customer/events')}>Back to Events</Button>}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <EntryPassManager onSuccess={setEntryPass} />
      <h1 className="text-2xl font-bold mb-4">Book Ticket for {event.title}</h1>
      <div className="mb-4">
        <div className="font-semibold">Show:</div>
        <div>{new Date(show.date).toLocaleDateString()} | {show.startTime} - {show.endTime}</div>
        <div className="text-xs text-gray-500">Available seats: {availableSeats}</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Number of Tickets</label>
          <input
            type="number"
            min={1}
            max={maxBookable}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="input w-full"
            required
            disabled={!entryPass}
          />
          {entryPass && <div className="text-xs text-gray-500 mt-1">Available head count: {entryPass.headCount}</div>}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>₹{(event.price * quantity).toLocaleString()}</span>
          </div>
        </div>
        {error && <div className="text-red-600 text-center font-semibold py-2 bg-red-50 rounded">{error}</div>}
        <Button 
          type="submit" 
          disabled={loading || !canBook || quantity > maxBookable} 
          className="w-full"
        >
          Proceed to Payment
        </Button>
        {!canBook && <div className="text-red-600 text-center font-semibold py-2 bg-red-50 rounded">You do not have enough entry pass head count. Please purchase or increment your entry pass above.</div>}
      </form>
    </div>
  );
} 