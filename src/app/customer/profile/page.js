"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/users/profile");
        setProfile(res.data.data || res.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="mb-4"><span className="font-semibold">Name:</span> {profile.name}</div>
      <div className="mb-4"><span className="font-semibold">Email:</span> {profile.email}</div>
      <div className="mb-4"><span className="font-semibold">Role:</span> {profile.role}</div>
      <div className="mb-4"><span className="font-semibold">Status:</span> {profile.status}</div>
      <div className="mb-4"><span className="font-semibold">Joined:</span> {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Stats</h2>
        <ul className="list-disc pl-6">
          <li>Tickets Booked: {profile.ticketsBooked || 0}</li>
          <li>Events Attended: {profile.eventsAttended || 0}</li>
        </ul>
      </div>
    </div>
  );
} 