"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="p-8 text-center">Loading tickets...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">My Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tickets.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500">No tickets booked yet.</div>
        ) : tickets.map(ticket => (
          <div key={ticket._id} className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-2">{ticket.events?.[0]?.event?.title || 'Event'}</h2>
            <div className="text-gray-500 mb-2">{ticket.events?.[0]?.event?.venue} | {ticket.events?.[0]?.event?.startDate ? new Date(ticket.events[0].event.startDate).toLocaleString() : ''} - {ticket.events?.[0]?.event?.endDate ? new Date(ticket.events[0].event.endDate).toLocaleString() : ''}</div>
            <div className="mb-2">Status: <span className="font-semibold">{ticket.status}</span></div>
            <div className="mb-2">Ticket Number: {ticket.ticketNumber}</div>
            <div className="mb-2">Purchase Date: {ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleString() : '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 