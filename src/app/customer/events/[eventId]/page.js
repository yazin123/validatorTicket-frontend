"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function CustomerEventDetailPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data.event || res.data);
      } catch (err) {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  if (loading) return <div className="p-8 text-center">Loading event...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <div className="mb-2 text-gray-600">{event.venue} | {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</div>
      <div className="mb-2">Capacity: {event.capacity} | Price: ${event.price}</div>
      <div className="mb-4">{event.description}</div>
      <Button className="w-full" onClick={() => router.push(`/customer/events/book?eventId=${event._id}`)}>Book This Event</Button>
    </div>
  );
} 