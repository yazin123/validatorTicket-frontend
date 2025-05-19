"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import EntryPassManager from '@/components/dashboard/EntryPassManager';
import { Calendar, MapPin, Clock, Users, DollarSign, Loader2, IndianRupee } from "lucide-react";

export default function CustomerEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-500 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-600 font-medium mb-2">Something went wrong</h3>
          <p className="text-gray-700">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <EntryPassManager />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <div className="mt-4 sm:mt-0 flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full sm:w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
           
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or check back later for new events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
                <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-white opacity-75" />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{event.title}</h2>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{event.venue}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{formatDate(event.startDate)}</div>
                        <div className="text-sm text-gray-500">
                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{event.capacity}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <IndianRupee className="h-5 w-5 text-gray-500 mr-1 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{event.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-5 line-clamp-3">{event.description}</p>
                  
                  <div className="flex gap-3">
                 
                    <Button 
                      className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50" 
                      onClick={() => router.push(`/customer/events/${event._id}`)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}