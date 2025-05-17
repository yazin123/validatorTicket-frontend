"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function BookEventPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", age: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data.event || res.data);
      } catch (err) {
        setError("Failed to load event");
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(`/tickets/book`, { eventId, ...form });
      toast.success("Ticket booked successfully!");
      router.push("/customer/tickets");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to book ticket");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!event) return <div className="p-8 text-center">Loading event...</div>;

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Book Ticket for {event.title}</h1>
      <div className="mb-4 text-gray-600">{event.venue} | {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input w-full" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="input w-full" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Phone Number</label>
          <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required className="input w-full" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Age</label>
          <input name="age" type="number" min="0" value={form.age} onChange={handleChange} required className="input w-full" />
        </div>
        {error && <div className="text-red-600 text-center font-semibold py-2 bg-red-50 rounded">{error}</div>}
        <Button type="submit" loading={loading} disabled={loading} className="w-full">Book Ticket</Button>
      </form>
    </div>
  );
} 