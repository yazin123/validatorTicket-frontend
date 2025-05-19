"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import EntryPassManager from '@/components/dashboard/EntryPassManager';

export default function CustomerEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await api.get("/events?status=published");
        setEvents(res.data.events || res.data.data || res.data || []);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleBook = (eventId) => {
    router.push(`/customer/events/${eventId}/book`);
  };

  if (loading) return <div className="p-8 text-center">Loading events...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <>
      <EntryPassManager />
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Available Events</h1>
        <div className="flex justify-end mb-4">
          <Button className="" onClick={() => router.push('/customer/events/book')}>Book Ticket</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events?.map(event => (
            <div key={event._id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <div className="text-gray-500 mb-2">{event.venue} | {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</div>
                <div className="mb-2">Capacity: {event.capacity} | Price: ${event.price}</div>
                <div className="mb-2">{event.description}</div>
              </div>
              <Button className="mt-4 w-full" onClick={() => router.push(`/customer/events/${event._id}`)}>View Details</Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 