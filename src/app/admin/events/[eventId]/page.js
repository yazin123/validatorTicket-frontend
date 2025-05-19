"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  BarChart3,
  Ticket,
  Download,
  Edit,
  UserPlus,
  QrCode,
  Eye,
  Tag,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Format time as HH:MM for display
function formatTime(timeString) {
  if (!timeString) return '';

  // Handle different time formats
  if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  return timeString;
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffDetails, setStaffDetails] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch event details
  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const res = await api.get(`/admin/events/${eventId}`);
        setEvent(res.data.event || res.data.data || res.data || null);
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
        console.error(err);
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

  // Gallery navigation
  const nextImage = () => {
    if (!event?.gallery?.length) return;
    setActiveImageIndex((prevIndex) =>
      prevIndex === event.gallery.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    if (!event?.gallery?.length) return;
    setActiveImageIndex((prevIndex) =>
      prevIndex === 0 ? event.gallery.length - 1 : prevIndex - 1
    );
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!event) return <div className="p-8 text-center">Event not found.</div>;

  const availableSeats = event.capacity - (event.ticketsSold || 0);
  const salePercentage = event.capacity > 0 ? Math.round((event.ticketsSold || 0) * 100 / event.capacity) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      {/* Header with quick actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="text-gray-600 flex items-center flex-wrap gap-3">
            <span className="flex items-center">
              <MapPin size={16} className="mr-1" />
              {event.venue}
            </span>
            <span className="flex items-center">
              <Calendar size={16} className="mr-1" />
              {new Date(event.startDate).toLocaleDateString()}
              {event.endDate && event.startDate !== event.endDate &&
                ` - ${new Date(event.endDate).toLocaleDateString()}`
              }
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
              }`}
            >
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/events/${eventId}/edit`}>
            <Button variant="outline" className="flex items-center gap-1">
              <Edit size={16} />
              Edit
            </Button>
          </Link>
          <Link href={`/admin/events/${eventId}/scan`}>
            <Button variant="outline" className="flex items-center gap-1">
              <QrCode size={16} />
              Scan
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => {
              // Export functionality placeholder
              toast.success("Export feature will be implemented soon");
            }}
          >
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("shows")}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === "shows"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Shows
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === "tickets"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Tickets
          </button>
          {/* Gallery tab button commented out
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === "gallery"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Gallery
          </button>
          */}
          {/* Staff tab button commented out
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === "staff"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Staff
          </button>
          */}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Main info with image */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="p-6 bg-white rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <p className="text-gray-600 mb-6">{event.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Capacity</div>
                    <div className="font-semibold">{event.capacity}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Price</div>
                    <div className="font-semibold">₹{event.price}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Available</div>
                    <div className="font-semibold">{availableSeats}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Shows</div>
                    <div className="font-semibold">{event.shows?.length || 0}</div>
                  </div>
                </div>

                {event.features && event.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.features.map((feature, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.tags && event.tags.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          # {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.terms && (
                  <div className="mt-6">
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-gray-600">{event.terms}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="p-6 bg-white rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Event Image</h2>
                {event.image ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="text-gray-400" size={48} />
                  </div>
                )}

                {/* Gallery Preview section - commented out
                <div className="mt-4">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">Gallery Preview</h3>
                  {event.gallery && event.gallery.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {event.gallery.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-md overflow-hidden">
                          <img
                            src={img}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              setActiveImageIndex(idx);
                              setShowGalleryModal(true);
                            }}
                          />
                        </div>
                      ))}
                      {event.gallery.length > 3 && (
                        <div
                          className="aspect-square rounded-md bg-gray-100 flex items-center justify-center cursor-pointer"
                          onClick={() => setActiveTab("gallery")}
                        >
                          <span className="text-gray-500 font-medium">+{event.gallery.length - 3}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No gallery images</p>
                  )}
                </div>
                */}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <Ticket size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Tickets Sold</div>
                  <div className="text-2xl font-bold">{event.ticketsSold || 0}</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${salePercentage}%` }}></div>
              </div>
              <div className="mt-1 text-xs text-gray-500 text-right">{salePercentage}% of capacity</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Revenue</div>
                  <div className="text-2xl font-bold">₹{event.revenue || 0}</div>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className={`${(event.revenue > 0) ? 'text-green-600' : 'text-gray-500'}`}>
                  {(event.ticketsSold || 0)} × ₹{event.price}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Attendance</div>
                  <div className="text-2xl font-bold">{event.attendance || 0}</div>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-500">
                  {event.attendance ? Math.round((event.attendance / (event.ticketsSold || 1)) * 100) : 0}% attendance rate
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Event Status</div>
                  <div className="text-2xl font-bold capitalize">{event.status}</div>
                </div>
              </div>
              {new Date() > new Date(event.endDate) ? (
                <div className="mt-2 text-sm text-red-500">Event ended</div>
              ) : new Date() > new Date(event.startDate) ? (
                <div className="mt-2 text-sm text-green-500">Event in progress</div>
              ) : (
                <div className="mt-2 text-sm text-blue-500">
                  Starts in {Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shows Tab */}
      {activeTab === "shows" && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Show Schedule</h2>
            <div className="text-sm text-gray-500">
              {event.shows?.length || 0} show{(event.shows?.length !== 1) ? 's' : ''} scheduled
            </div>
          </div>

          {!event.shows || event.shows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No shows scheduled for this event.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {event.shows.map((show, index) => {
                    const showDate = new Date(show.date);
                    const now = new Date();
                    const isPast = showDate < now;
                    const isToday = showDate.toDateString() === now.toDateString();
                    let status = isPast ? "completed" : "upcoming";

                    // Check if the show is in progress (today and between start and end times)
                    if (isToday) {
                      const startTime = show.startTime.split(':');
                      const endTime = show.endTime.split(':');
                      const startHour = parseInt(startTime[0]);
                      const startMinute = parseInt(startTime[1]);
                      const endHour = parseInt(endTime[0]);
                      const endMinute = parseInt(endTime[1]);

                      const currentHour = now.getHours();
                      const currentMinute = now.getMinutes();

                      if (
                        (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) &&
                        (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute))
                      ) {
                        status = "in progress";
                      } else if (currentHour > endHour || (currentHour === endHour && currentMinute > endMinute)) {
                        status = "completed";
                      }
                    }

                    return (
                      <tr key={show.showId || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(show.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(show.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(show.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${status === 'in progress' ? 'bg-green-100 text-green-800' :
                              status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {status === 'in progress' ? 'In Progress' :
                              status === 'upcoming' ? 'Upcoming' : 'Completed'
                            }
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Tickets</h2>
            <div className="text-sm text-gray-500">
              {pagination.total} ticket{pagination.total !== 1 ? 's' : ''}
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No tickets sold for this event yet.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ticket.ticketNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.purchasedBy || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${ticket.status === 'verified' ? 'bg-green-100 text-green-800' :
                              ticket.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{ticket.amount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => {
                              // View ticket details functionality
                              toast.success("Ticket view to be implemented");
                            }}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={handlePrevPage}
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={handleNextPage}
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Gallery Tab - Commented out
      {activeTab === "gallery" && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Event Gallery</h2>
            <div className="text-sm text-gray-500">
              {event.gallery?.length || 0} image{(event.gallery?.length !== 1) ? 's' : ''}
            </div>
          </div>

          {!event.gallery || event.gallery.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No gallery images available for this event.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {event.gallery.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer border hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setShowGalleryModal(true);
                  }}
                >
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      */}

      {/* Staff Tab - Commented out
      {activeTab === "staff" && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Staff Assigned</h2>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => {
                // Add staff functionality
                toast.success("Staff assignment to be implemented");
              }}
            >
              <UserPlus size={16} />
              Assign Staff
            </Button>
          </div>

          {staffDetails.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No staff assigned to this event.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffDetails.map((staff) => (
                    <tr key={staff._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {staff.profileImage ? (
                            <img
                              src={staff.profileImage}
                              alt={staff.name}
                              className="h-8 w-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-500 text-sm font-medium">
                                {staff.name?.charAt(0) || "U"}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            // Remove staff functionality
                            toast.success("Staff removal to be implemented");
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      */}

      {/* Image Gallery Modal - Commented out
      {showGalleryModal && event.gallery && event.gallery.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="max-w-4xl w-full max-h-screen p-4">
            <div className="relative">
              <button
                onClick={() => setShowGalleryModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>

              <div className="relative">
                <img
                  src={event.gallery[activeImageIndex]}
                  alt={`Gallery ${activeImageIndex + 1}`}
                  className="max-h-[80vh] mx-auto"
                />

                <button
                  onClick={prevImage}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-6 bg-black bg-opacity-50 rounded-full p-2 text-white"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-6 bg-black bg-opacity-50 rounded-full p-2 text-white"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="text-center text-white mt-4">
                {activeImageIndex + 1} of {event.gallery.length}
              </div>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
} 