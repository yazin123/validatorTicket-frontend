"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffDetails, setStaffDetails] = useState([]);

  // Fetch event details
  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const res = await api.get(`/admin/events/${eventId}`);
        setEvent(res.data);
        // Fetch staff details if staffAssigned exists
        if (res.data.staffAssigned && res.data.staffAssigned.length > 0) {
          const staffRes = await api.get("/admin/users");
          const allUsers = staffRes.data.users || staffRes.data;
          const staff = allUsers.filter(u => res.data.staffAssigned.includes(u._id));
          setStaffDetails(staff);
        } else {
          setStaffDetails([]);
        }
      } catch (err) {
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  // Fetch tickets for this event
  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await api.get(`/admin/events/${eventId}/tickets?page=${pagination.page}&limit=${pagination.limit}`);
        setTickets(res.data.tickets);
        setPagination((prev) => ({ ...prev, ...res.data.pagination }));
      } catch (err) {
        toast.error("Failed to load tickets");
      }
    }
    if (eventId) fetchTickets();
  }, [eventId, pagination.page, pagination.limit]);

  const handlePrevPage = () => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }));
  const handleNextPage = () => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }));

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!event) return <div className="p-8 text-center">Event not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
          <div className="text-gray-500 mb-2">{event.venue} | {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</div>
          <div className="mb-2">Capacity: {event.capacity} | Price: ₹{event.price}</div>
          <div className="mb-2">{event.description}</div>
        </div>
        {event.image && (
          <img src={event.image} alt={event.title} className="w-40 h-32 object-cover rounded-lg border" />
        )}
      </div>

      {/* Attendance/Revenue/Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Tickets Sold</div>
          <div className="text-2xl font-bold">{event.ticketsSold || 0}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Revenue</div>
          <div className="text-2xl font-bold">₹{event.revenue || 0}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Attendance Rate</div>
          <div className="text-2xl font-bold">{event.attendanceRate || 0}%</div>
        </div>
      </div>

      {/* Ticket Sales Chart Placeholder */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="font-medium mb-2">Ticket Sales Over Time</div>
        <div className="h-40 flex items-center justify-center text-gray-400">[Ticket Sales Chart Here]</div>
      </div>

      {/* Tickets Table */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="font-medium mb-2">Tickets</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Ticket #</th>
              <th className="py-2 text-left">User</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">Purchase Date</th>
              <th className="py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="border-b">
                <td className="py-2">{ticket.ticketNumber}</td>
                <td className="py-2">{ticket.purchasedBy || "-"}</td>
                <td className="py-2">{ticket.status}</td>
                <td className="py-2">{ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleDateString() : "-"}</td>
                <td className="py-2">₹{ticket.amount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-2 gap-2">
          <Button size="sm" variant="outline" disabled={pagination.page === 1} onClick={handlePrevPage}>Previous</Button>
          <span className="px-2">Page {pagination.page} of {pagination.pages}</span>
          <Button size="sm" variant="outline" disabled={pagination.page === pagination.pages} onClick={handleNextPage}>Next</Button>
        </div>
      </div>

      {/* Staff Assigned */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="font-medium mb-2">Staff Assigned</div>
        {staffDetails.length === 0 ? (
          <div className="text-gray-600">No staff assigned.</div>
        ) : (
          <ul className="space-y-1">
            {staffDetails.map(staff => (
              <li key={staff._id} className="flex items-center gap-2">
                <span className="font-medium">{staff.name}</span>
                <span className="text-xs text-gray-500">({staff.role})</span>
                <span className="text-xs text-gray-400">{staff.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Export/Reporting Options Placeholder */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="font-medium mb-2">Export / Reporting</div>
        <Button variant="outline" onClick={() => toast.success("Exported!")}>Export Event Data</Button>
      </div>
    </div>
  );
} 