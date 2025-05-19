"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { nanoid } from 'nanoid';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  X,
  Copy
} from 'lucide-react';

// Days of the week for calendar header
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate calendar days for a given month and year
function getCalendarDays(month, year) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Get days from prev month to fill in first week
  const prevMonthDays = [];
  if (startingDayOfWeek > 0) {
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(year, month - 1, prevLastDay - i),
        isCurrentMonth: false
      });
    }
  }
  
  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    date: new Date(year, month, i + 1),
    isCurrentMonth: true
  }));
  
  // Next month days to fill calendar grid (6 rows max)
  const nextMonthDays = [];
  const totalDaysShown = prevMonthDays.length + currentMonthDays.length;
  const daysNeeded = Math.ceil(totalDaysShown / 7) * 7 - totalDaysShown;
  
  for (let i = 1; i <= daysNeeded; i++) {
    nextMonthDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }
  
  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
}

// Format date as YYYY-MM-DD for input fields
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

function ShowModal({ open, onClose, onSave, initial, prefilledDate, enableKeepOpen }) {
  const [date, setDate] = useState(initial?.date || prefilledDate || '');
  const [startTime, setStartTime] = useState(initial?.startTime || '10:00');
  const [endTime, setEndTime] = useState(initial?.endTime || '11:00');
  const [error, setError] = useState('');
  const [addAnother, setAddAnother] = useState(false);

  useEffect(() => {
    // Update date if prefilledDate changes and there's no initial date set
    if (prefilledDate && !initial) {
      setDate(prefilledDate);
    }
  }, [prefilledDate, initial]);

  const handleSave = () => {
    if (!date || !startTime || !endTime) {
      setError('All fields are required');
      return;
    }
    setError('');
    onSave({
      showId: initial?.showId || `SHOW-${Date.now()}-${nanoid(6)}`,
      date,
      startTime,
      endTime
    }, addAnother);
    
    if (addAnother) {
      // Reset form for next show but keep the date
      setStartTime('10:00');
      setEndTime('11:00');
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative animate-fadeIn">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2" />
          {initial ? 'Edit Show' : 'Add Show'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-full" required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input w-full" required />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input w-full" required />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          
          {enableKeepOpen && (
            <div className="flex items-center mt-2">
              <input 
                type="checkbox" 
                id="addAnother" 
                checked={addAnother} 
                onChange={e => setAddAnother(e.target.checked)}
                className="mr-2" 
              />
              <label htmlFor="addAnother" className="text-sm text-gray-700">
                Add another show on this date
              </label>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave}>{initial ? 'Update' : 'Add'}</Button>
        </div>
      </div>
    </div>
  );
}

// Duplicate Modal component for selecting days to duplicate a show to
function DuplicateModal({ open, onClose, onDuplicate, show }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentView, setCurrentView] = useState(new Date());
  const [error, setError] = useState('');
  
  // Generate calendar for current month view
  const calendarDays = getCalendarDays(currentView.getMonth(), currentView.getFullYear());
  const monthName = currentView.toLocaleString('default', { month: 'long' });
  
  // Previous month
  const prevMonth = () => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() - 1, 1));
  };
  
  // Next month
  const nextMonth = () => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() + 1, 1));
  };
  
  // Toggle date selection
  const toggleDate = (date) => {
    const dateStr = formatDateForInput(date);
    
    // Don't allow selecting the original show's date
    if (dateStr === show.date) {
      return;
    }
    
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };
  
  // Handle duplication
  const handleDuplicate = () => {
    if (selectedDates.length === 0) {
      setError('Please select at least one date');
      return;
    }
    
    onDuplicate(show, selectedDates);
    onClose();
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative animate-fadeIn">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Copy className="w-5 h-5 mr-2" />
          Duplicate Show
        </h2>
        
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Original Show:</div>
          <div className="bg-blue-50 p-2 rounded text-sm">
            <div className="font-medium">{new Date(show.date).toLocaleDateString()}</div>
            <div>{formatTime(show.startTime)} - {formatTime(show.endTime)}</div>
          </div>
        </div>
        
        <div className="mb-2 font-medium">Select dates to duplicate to:</div>
        
        {/* Month navigation */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-lg font-medium">
            {monthName} {currentView.getFullYear()}
          </div>
          <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mini calendar */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dateStr = formatDateForInput(day.date);
            const isSelected = selectedDates.includes(dateStr);
            const isOriginalDate = show.date === dateStr;
            const isPast = day.date < new Date() && day.date.setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);
            
            return (
              <div
                key={index}
                onClick={() => !isPast && !isOriginalDate && toggleDate(day.date)}
                className={`
                  p-2 text-center text-sm rounded-md cursor-pointer
                  ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                  ${isSelected ? 'bg-blue-500 text-white' : ''}
                  ${isOriginalDate ? 'bg-blue-100 text-blue-800' : ''}
                  ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                `}
              >
                {day.date.getDate()}
              </div>
            );
          })}
        </div>
        
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="button" 
            onClick={handleDuplicate}
            disabled={selectedDates.length === 0}
          >
            Duplicate to {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ shows, onAddShow, onEditShow, onRemoveShow, onDuplicateShow }) {
  const [currentView, setCurrentView] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingShowId, setEditingShowId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  
  const calendarDays = getCalendarDays(currentView.getMonth(), currentView.getFullYear());
  const monthName = currentView.toLocaleString('default', { month: 'long' });
  
  const prevMonth = () => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() + 1, 1));
  };
  
  const handleDayClick = (day) => {
    const dateStr = formatDateForInput(day.date);
    setSelectedDay(dateStr);
    setShowModal(true);
  };
  
  const handleShowClick = (showId, e) => {
    e.stopPropagation();
    setEditingShowId(showId);
    setShowModal(true);
  };
  
  const handleRemoveShow = (showId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this show?')) {
      onRemoveShow(showId);
    }
  };
  
  const getShowsForDay = (date) => {
    const dateStr = formatDateForInput(date);
    return shows.filter(show => show.date === dateStr);
  };
  
  const handleSaveShow = (show, keepOpen) => {
    if (editingShowId) {
      onEditShow(editingShowId, show);
      setEditingShowId(null);
    } else {
      onAddShow(show);
    }
    
    if (!keepOpen) {
      setShowModal(false);
      setSelectedDay(null);
    }
  };
  
  const handleDuplicateClick = (showId, e) => {
    e.stopPropagation();
    onDuplicateShow(showId);
  };
  
  return (
    <div className="mb-8">
      <ShowModal 
        open={showModal} 
        onClose={() => {
          setShowModal(false);
          setEditingShowId(null);
          setSelectedDay(null);
        }}
        onSave={handleSaveShow}
        initial={editingShowId ? shows.find(show => show.showId === editingShowId) : null}
        prefilledDate={selectedDay}
        enableKeepOpen={!editingShowId}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-bold">Show Schedule</div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              setShowModal(true);
              setEditingShowId(null);
              setSelectedDay(null);
            }}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Show
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow">
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <button 
            onClick={prevMonth} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {monthName} {currentView.getFullYear()}
          </h3>
          <button 
            onClick={nextMonth} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-500 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 min-h-[500px]">
          {calendarDays.map((day, i) => {
            const dayShows = getShowsForDay(day.date);
            const formattedDate = formatDateForInput(day.date);
            const isToday = new Date().toDateString() === day.date.toDateString();
            
            return (
              <div 
                key={i} 
                onClick={() => handleDayClick(day)}
                className={`
                  p-2 border-r border-b min-h-[100px] last:border-r-0 
                  hover:bg-gray-50 cursor-pointer transition-colors
                  ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                  ${isToday ? 'bg-blue-50' : ''}
                `}
              >
                <div className={`
                  text-sm font-medium mb-1 
                  ${isToday ? 'text-blue-600' : ''} 
                  ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                `}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayShows.map(show => (
                    <div 
                      key={show.showId}
                      className="text-xs bg-blue-100 text-blue-800 rounded p-1 relative group"
                    >
                      <div className="font-medium">
                        {formatTime(show.startTime)} - {formatTime(show.endTime)}
                      </div>
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex">
                        <button 
                          onClick={(e) => handleShowClick(show.showId, e)}
                          className="p-1 text-blue-800 hover:text-blue-600"
                        >
                          <div className="w-3 h-3">•</div>
                        </button>
                        <button 
                          onClick={(e) => handleDuplicateClick(show.showId, e)}
                          className="p-1 text-blue-800 hover:text-blue-600"
                        >
                          <div className="w-3 h-3">+</div>
                        </button>
                        <button 
                          onClick={(e) => handleRemoveShow(show.showId, e)}
                          className="p-1 text-blue-800 hover:text-red-600"
                        >
                          <div className="w-3 h-3">×</div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EditEventPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
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
  const [shows, setShows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingShowId, setEditingShowId] = useState(null);
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [duplicatingShow, setDuplicatingShow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await api.get(`/admin/events/${eventId}`);
        const event = res.data;
        
        // Set form data
        setForm({
          ...form,
          ...event,
          tags: event.tags ? event.tags.join(", ") : "",
          features: event.features ? event.features.join(", ") : "",
        });
        
        // Set shows if available
        if (event.shows && Array.isArray(event.shows)) {
          setShows(event.shows);
        }
        
        // Set image preview
        if (event.image) setImagePreview(event.image);
      } catch (err) {
        setError("Failed to load event");
        console.error(err);
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
        }
      }
    } else if (name === "tags" || name === "features") {
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddShow = (show) => {
    setShows([...shows, show]);
  };

  const handleEditShow = (showId, updatedShow) => {
    setShows(shows.map(show => show.showId === showId ? { ...updatedShow, showId } : show));
  };

  const handleRemoveShow = (showId) => {
    setShows(shows.filter(show => show.showId !== showId));
  };
  
  const calculateEventDates = () => {
    if (shows.length === 0) {
      return {
        startDate: new Date(),
        endDate: new Date()
      };
    }
    
    let startDate = new Date(shows[0].date + "T" + shows[0].startTime);
    let endDate = new Date(shows[0].date + "T" + shows[0].endTime);
    
    shows.forEach(show => {
      const showStart = new Date(show.date + "T" + show.startTime);
      const showEnd = new Date(show.date + "T" + show.endTime);
      
      if (showStart < startDate) startDate = showStart;
      if (showEnd > endDate) endDate = showEnd;
    });
    
    return { startDate, endDate };
  };
  
  const handleDuplicateShow = (show, dates) => {
    const showToDuplicate = shows.find(s => s.showId === show.showId) || show;
    
    const newShows = dates.map(date => ({
      showId: `SHOW-${Date.now()}-${nanoid(6)}`,
      date,
      startTime: showToDuplicate.startTime,
      endTime: showToDuplicate.endTime
    }));
    
    setShows([...shows, ...newShows]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate shows
    if (shows.length === 0) {
      setError("Please add at least one show for this event");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(form).forEach(([key, value]) => {
        if (key === "gallery" && value.length > 0) {
          value.forEach((file) => formData.append("gallery", file));
        } else if (key === "tags" || key === "features") {
          if (value) formData.append(key, value.split(",").map(s => s.trim()));
        } else if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      
      // Calculate start and end dates from shows
      const { startDate, endDate } = calculateEventDates();
      formData.append("startDate", new Date(startDate).toISOString());
      formData.append("endDate", new Date(endDate).toISOString());
      
      // Add shows array
      formData.append('shows', JSON.stringify(shows));
      
      // Update event
      await api.put(`/admin/events/${eventId}`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      toast.success("Event updated successfully!");
      router.push(`/admin/events/${eventId}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Event</h1>
      
      {/* Shows Calendar View */}
      <CalendarView 
        shows={shows} 
        onAddShow={handleAddShow}
        onEditShow={handleEditShow}
        onRemoveShow={handleRemoveShow}
        onDuplicateShow={(showId) => {
          const show = shows.find(s => s.showId === showId);
          if (show) {
            setDuplicatingShow(show);
            setDuplicateModal(true);
          }
        }}
      />
      
      {duplicateModal && duplicatingShow && (
        <DuplicateModal
          open={duplicateModal}
          onClose={() => {
            setDuplicateModal(false);
            setDuplicatingShow(null);
          }}
          onDuplicate={handleDuplicateShow}
          show={duplicatingShow}
        />
      )}
      
      {/* Shows List View Alternative */}
      {shows.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Show List</h2>
          <div className="bg-white rounded-lg border shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shows.map(show => (
                    <tr key={show.showId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(show.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(show.startTime)} - {formatTime(show.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                        <button 
                          onClick={() => {
                            setEditingShowId(show.showId);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDuplicatingShow(show);
                            setDuplicateModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Duplicate
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this show?')) {
                              handleRemoveShow(show.showId);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2">Title <span className="text-red-500">*</span></label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" 
              placeholder="Event title" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Venue <span className="text-red-500">*</span></label>
            <input 
              name="venue" 
              value={form.venue} 
              onChange={handleChange} 
              required 
              className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" 
              placeholder="Venue" 
            />
          </div>
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Description <span className="text-red-500">*</span></label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            required 
            className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" 
            rows={3} 
            placeholder="Event description" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2">Price <span className="text-red-500">*</span></label>
            <input 
              name="price" 
              type="number" 
              min="0" 
              value={form.price} 
              onChange={handleChange} 
              required 
              className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" 
              placeholder="0" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Capacity <span className="text-red-500">*</span></label>
            <input 
              name="capacity" 
              type="number" 
              min="1" 
              value={form.capacity} 
              onChange={handleChange} 
              required 
              className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" 
              placeholder="100" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2">Status</label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange} 
              className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2">Main Image</label>
            <input 
              name="image" 
              type="file" 
              accept="image/*" 
              onChange={handleChange} 
              className="input w-full" 
            />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-24 object-cover rounded-lg border" 
                />
              </div>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2">Gallery (multiple images)</label>
            <input 
              name="gallery" 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleChange} 
              className="input w-full" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2">Tags (comma separated)</label>
            <input 
              name="tags" 
              value={form.tags} 
              onChange={handleChange} 
              className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" 
              placeholder="music, party, tech" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Features (comma separated)</label>
            <input 
              name="features" 
              value={form.features} 
              onChange={handleChange} 
              className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" 
              placeholder="VIP, Free Drinks" 
            />
          </div>
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Terms</label>
          <textarea 
            name="terms" 
            value={form.terms} 
            onChange={handleChange} 
            className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" 
            rows={2} 
            placeholder="Event terms and conditions" 
          />
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/admin/events/${eventId}`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={loading} 
            disabled={loading}
          >
            Update Event
          </Button>
        </div>
      </form>
    </div>
  );
} 