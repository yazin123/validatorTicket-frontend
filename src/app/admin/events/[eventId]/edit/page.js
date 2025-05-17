"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export default function EditEventPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    venue: "",
    image: null,
    gallery: [],
    capacity: 0,
    price: 0,
    status: "draft",
    tags: "",
    features: "",
    terms: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await api.get(`/admin/events/${eventId}`);
        const event = res.data;
        setForm({
          ...form,
          ...event,
          startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
          endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
          tags: event.tags ? event.tags.join(", ") : "",
          features: event.features ? event.features.join(", ") : "",
        });
        if (event.image) setImagePreview(event.image);
      } catch (err) {
        setError("Failed to load event");
      }
    }
    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "gallery") {
        setForm((prev) => ({ ...prev, gallery: Array.from(files) }));
      } else {
        setForm((prev) => ({ ...prev, [name]: files[0] }));
        if (files[0]) {
          setImagePreview(URL.createObjectURL(files[0]));
        } else {
          setImagePreview(null);
        }
      }
    } else if (name === "tags" || name === "features") {
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "gallery" && value.length > 0) {
          value.forEach((file) => formData.append("gallery", file));
        } else if (key === "tags" || key === "features") {
          if (value) formData.append(key, value.split(",").map(s => s.trim()));
        } else if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      if (form.startDate) formData.set("startDate", new Date(form.startDate).toISOString());
      if (form.endDate) formData.set("endDate", new Date(form.endDate).toISOString());
      await api.put(`/admin/events/${eventId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Event updated!");
      router.push(`/admin/events/${eventId}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required className="input w-full" placeholder="Event title" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Venue <span className="text-red-500">*</span></label>
            <input name="venue" value={form.venue} onChange={handleChange} required className="input w-full" placeholder="Venue" />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Description <span className="text-red-500">*</span></label>
          <textarea name="description" value={form.description} onChange={handleChange} required className="input w-full" rows={3} placeholder="Event description" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Start Date <span className="text-red-500">*</span></label>
            <input name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} required className="input w-full" />
          </div>
          <div>
            <label className="block font-semibold mb-1">End Date <span className="text-red-500">*</span></label>
            <input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} required className="input w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Price <span className="text-red-500">*</span></label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className="input w-full" placeholder="0" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Capacity <span className="text-red-500">*</span></label>
            <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required className="input w-full" placeholder="100" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block font-semibold mb-1">Main Image</label>
            <input name="image" type="file" accept="image/*" onChange={handleChange} className="input w-full" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 rounded-lg border w-32 h-24 object-cover" />
            )}
          </div>
          <div>
            <label className="block font-semibold mb-1">Gallery (multiple images)</label>
            <input name="gallery" type="file" accept="image/*" multiple onChange={handleChange} className="input w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="input w-full" placeholder="music, party, tech" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Features (comma separated)</label>
            <input name="features" value={form.features} onChange={handleChange} className="input w-full" placeholder="VIP, Free Drinks" />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Terms</label>
          <textarea name="terms" value={form.terms} onChange={handleChange} className="input w-full" rows={2} placeholder="Event terms and conditions" />
        </div>
        {error && <div className="text-red-600 text-center font-semibold py-2 bg-red-50 rounded">{error}</div>}
        <div className="flex justify-center">
          <Button type="submit" loading={loading} disabled={loading} className="w-full md:w-1/2">Update Event</Button>
        </div>
      </form>
    </div>
  );
} 