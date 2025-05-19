"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
            <div key={day} className="text-center text-xs font-medium text-gray-500">
              {day.charAt(0)}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dateStr = formatDateForInput(day.date);
            const isSelected = selectedDates.includes(dateStr);
            const isOriginalDate = show.date === dateStr;
            const isDisabled = !day.isCurrentMonth;
            
            return (
              <div 
                key={index}
                onClick={() => !isDisabled && !isOriginalDate && toggleDate(day.date)}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm
                  ${isDisabled ? 'text-gray-300' : 'cursor-pointer'}
                  ${isOriginalDate ? 'bg-blue-200 text-blue-800' : ''}
                  ${isSelected ? 'bg-green-500 text-white' : ''}
                  ${!isSelected && !isOriginalDate && !isDisabled ? 'hover:bg-gray-100' : ''}
                `}
              >
                {day.date.getDate()}
              </div>
            );
          })}
        </div>
        
        {selectedDates.length > 0 && (
          <div className="mb-4">
            <div className="text-sm mb-1 font-medium">Selected dates ({selectedDates.length}):</div>
            <div className="flex flex-wrap gap-1">
              {selectedDates.map(date => (
                <div key={date} className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full flex items-center">
                  {new Date(date).toLocaleDateString()}
                  <button 
                    onClick={() => setSelectedDates(selectedDates.filter(d => d !== date))}
                    className="ml-1 text-green-700 hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [prefilledDate, setPrefilledDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShowId, setEditingShowId] = useState(null);
  const [keepModalOpen, setKeepModalOpen] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [duplicatingShow, setDuplicatingShow] = useState(null);

  const calendarDays = getCalendarDays(currentMonth, currentYear);
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });

  // Go to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Go to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle clicking on a day to add a show
  const handleDayClick = (day) => {
    setPrefilledDate(formatDateForInput(day.date));
    setEditingShowId(null);
    setShowModal(true);
  };

  // Handle clicking on an existing show to edit it
  const handleShowClick = (showId, e) => {
    e.stopPropagation(); // Prevent triggering day click
    setEditingShowId(showId);
    setShowModal(true);
  };

  // Handle removing a show
  const handleRemoveShow = (showId, e) => {
    e.stopPropagation(); // Prevent triggering other events
    if (confirm('Are you sure you want to delete this show?')) {
      onRemoveShow(showId);
    }
  };

  // Find shows for a specific day
  const getShowsForDay = (date) => {
    const dateStr = formatDateForInput(date);
    return shows.filter(show => show.date === dateStr);
  };

  // Handle save from modal
  const handleSaveShow = (show, keepOpen) => {
    if (editingShowId) {
      onEditShow(editingShowId, show);
    } else {
      onAddShow(show);
    }
    
    if (keepOpen) {
      // Reset for a new show on the same date
      setEditingShowId(null);
    } else {
      setShowModal(false);
    }
  };

  // Handle duplicating a show
  const handleDuplicateClick = (showId, e) => {
    e.stopPropagation(); // Prevent triggering other events
    const showToDuplicate = shows.find(s => s.showId === showId);
    if (showToDuplicate) {
      setDuplicatingShow(showToDuplicate);
      setDuplicateModal(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2" />
          Event Shows Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium min-w-32 text-center">
            {monthName} {currentYear}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Calendar header with days of week */}
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="bg-gray-50 text-center py-2 font-medium text-gray-700">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const dayShows = getShowsForDay(day.date);
          const isToday = day.date.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                bg-white min-h-24 p-2 border border-gray-100
                ${day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'} 
                ${isToday ? 'bg-blue-50' : ''}
                hover:bg-gray-50 cursor-pointer transition-colors relative
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <div className={`
                  text-sm font-medium  
                  ${isToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}
                `}>
                  {day.date.getDate()}
                </div>
                {day.isCurrentMonth && (
                  <div 
                    className="text-xs text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              {/* Shows for this day */}
              <div className="space-y-1">
                {dayShows.map(show => (
                  <div 
                    key={show.showId}
                    className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate hover:bg-blue-200 transition-colors flex items-center justify-between group"
                  >
                    <div 
                      className="flex items-center truncate cursor-pointer flex-1"
                      onClick={(e) => handleShowClick(show.showId, e)}
                    >
                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {formatTime(show.startTime)} - {formatTime(show.endTime)}
                      </span>
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1"
                        onClick={(e) => handleDuplicateClick(show.showId, e)}
                        title="Duplicate show"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 p-1"
                        onClick={(e) => handleRemoveShow(show.showId, e)}
                        title="Delete show"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Show count badge if more than 3 shows */}
                {dayShows.length > 3 && (
                  <div className="text-xs text-center bg-blue-50 text-blue-600 rounded-full px-2 mt-1">
                    +{dayShows.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show modal */}
      <ShowModal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSaveShow} 
        initial={editingShowId ? shows.find(s => s.showId === editingShowId) : null}
        prefilledDate={prefilledDate}
        enableKeepOpen={!editingShowId} // Only enable "Add another" when creating new shows
      />

      {/* Duplicate modal */}
      <DuplicateModal 
        open={duplicateModal}
        onClose={() => setDuplicateModal(false)}
        onDuplicate={(show, dates) => {
          onDuplicateShow(show, dates);
          setDuplicateModal(false);
        }}
        show={duplicatingShow}
      />
    </div>
  );
}

export default function CreateEventPage() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [shows, setShows] = useState([]);
  const [showListView, setShowListView] = useState(false);

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

  const handleAddShow = (show) => {
    setShows(prev => [...prev, show]);
  };

  const handleEditShow = (showId, updatedShow) => {
    setShows(prev => prev.map(show => 
      show.showId === showId ? updatedShow : show
    ));
  };

  const handleRemoveShow = (showId) => {
    setShows(prev => prev.filter(show => show.showId !== showId));
  };

  // Calculate event start and end dates from shows
  const calculateEventDates = () => {
    if (shows.length === 0) return { startDate: '', endDate: '' };
    
    // Sort shows by date
    const sortedShows = [...shows].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get earliest (first) and latest (last) show dates
    const firstShow = sortedShows[0];
    const lastShow = sortedShows[sortedShows.length - 1];
    
    // Format as YYYY-MM-DDT00:00 for datetime-local input
    let startDate = `${firstShow.date}T${firstShow.startTime}`;
    let endDate = `${lastShow.date}T${lastShow.endTime}`;
    
    return { startDate, endDate };
  };

  // Duplicate a show to multiple dates
  const handleDuplicateShow = (show, dates) => {
    const newShows = dates.map(date => ({
      showId: `SHOW-${Date.now()}-${nanoid(6)}`,
      date,
      startTime: show.startTime,
      endTime: show.endTime
    }));
    
    setShows(prev => [...prev, ...newShows]);
    toast.success(`Show duplicated to ${dates.length} date${dates.length !== 1 ? 's' : ''}`);
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
      
      // POST to backend
      await api.post("/admin/events", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Event created!");
      router.push("/admin/events");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 mt-8 animate-fadeIn">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 tracking-tight">Create Event</h1>
      
      {/* Calendar view for managing shows */}
      <CalendarView 
        shows={shows} 
        onAddShow={handleAddShow} 
        onEditShow={handleEditShow}
        onRemoveShow={handleRemoveShow}
        onDuplicateShow={handleDuplicateShow}
      />
      
      {/* Show List View Toggle */}
      {shows.length > 0 && (
        <div className="mb-8">
          <button 
            onClick={() => setShowListView(!showListView)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            {showListView ? 'Hide Show List' : 'View Show List'} ({shows.length} shows)
          </button>
          
          {/* List View of Shows */}
          {showListView && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shows.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map(show => (
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
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2">Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="Event title" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Venue <span className="text-red-500">*</span></label>
            <input name="venue" value={form.venue} onChange={handleChange} required className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="Venue" />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2">Description <span className="text-red-500">*</span></label>
          <textarea name="description" value={form.description} onChange={handleChange} required className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Event description" />
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2">Price <span className="text-red-500">*</span></label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="0" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Capacity <span className="text-red-500">*</span></label>
            <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="100" />
          </div>
        </div>
        
        {/* Event Date Range (Calculated) */}
        {shows.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="font-medium mb-2 text-blue-800">Event Period (Calculated from Shows)</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Start Date & Time</div>
                <div className="font-medium">{calculateEventDates().startDate.replace('T', ' ')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">End Date & Time</div>
                <div className="font-medium">{calculateEventDates().endDate.replace('T', ' ')}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <label className="block font-semibold mb-2">Main Image</label>
            <input name="image" type="file" accept="image/*" onChange={handleChange} className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 rounded-lg border w-32 h-24 object-cover" />
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2">Gallery (multiple images)</label>
            <input name="gallery" type="file" accept="image/*" multiple onChange={handleChange} className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="music, party, tech" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Features (comma separated)</label>
            <input name="features" value={form.features} onChange={handleChange} className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="VIP, Free Drinks" />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2">Terms</label>
          <textarea name="terms" value={form.terms} onChange={handleChange} className="input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Event terms and conditions" />
        </div>
        
        {error && <div className="text-red-600 text-center font-semibold py-3 bg-red-50 rounded">{error}</div>}
        <div className="flex justify-center">
          <Button type="submit" loading={loading} disabled={loading} className="w-full md:w-1/2 text-lg py-3">Create Event</Button>
        </div>
      </form>
    </div>
  );
} 