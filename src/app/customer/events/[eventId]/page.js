"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import EntryPassManager from '@/components/dashboard/EntryPassManager';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, 
  MapPin, Users, Tag, Info, Heart, Share2, Star, X, Ticket 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Text, Environment } from "@react-three/drei";

// Days of the week for calendar header
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Convert ISO date string to YYYY-MM-DD
function formatDateToYYYYMMDD(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Get calendar days for month view
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

// Format time from "14:00" to "2:00 PM"
function formatTime(timeString) {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (e) {
    return timeString;
  }
}

// Animated 3D event logo component
function EventLogo({ title }) {
  const mesh = useRef();
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#4f46e5" />
      <Text
        position={[0, 0, 1.01]}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={0.4}
      >
        {title?.charAt(0) || "E"}
      </Text>
    </mesh>
  );
}

// Show bubble component for 3D visualization
function ShowBubbles({ shows, onShowClick }) {
  const group = useRef();
  
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.001;
    }
  });

  const bubblePositions = shows.slice(0, 12).map((_, i) => {
    const angle = (i / Math.min(12, shows.length)) * Math.PI * 2;
    const radius = 5;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 4,
      Math.sin(angle) * radius
    ];
  });

  return (
    <group ref={group}>
      <Stars radius={30} depth={50} count={500} factor={4} fade />
      {shows.slice(0, 12).map((show, i) => (
        <mesh 
          key={show.showId}
          position={bubblePositions[i]}
          onClick={() => onShowClick(show.showId)}
        >
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial 
            color="#6366f1" 
            emissive="#4f46e5"
            emissiveIntensity={0.2}
            roughness={0.2}
            metalness={0.8}
          />
          <Text
            position={[0, 0, 0.71]}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontSize={0.2}
          >
            {formatTime(show.startTime)}
          </Text>
        </mesh>
      ))}
      <Environment preset="city" />
    </group>
  );
}

export default function CustomerEventDetailPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState('');
  const [viewType, setViewType] = useState('calendar'); // 'calendar', 'list', or '3d'
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShowInfoOpen, setIsShowInfoOpen] = useState(false);
  
  // Calendar state
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await api.get(`/events/${eventId}`);
        const eventData = res.data.event || res.data.data || res.data || null;
        setEvent(eventData);
        
        // Set the first show as selected by default if available
        if (eventData?.shows?.length > 0) {
          const sortedShows = [...eventData.shows].sort(
            (a, b) => new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime)
          );
          setSelectedShow(sortedShows[0]?.showId || '');
        }
      } catch (err) {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

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

  // Get shows for a specific date
  const getShowsForDate = (date) => {
    if (!event?.shows) return [];
    const dateStr = formatDateToYYYYMMDD(date);
    return event.shows.filter(show => formatDateToYYYYMMDD(show.date) === dateStr);
  };

  // Find the currently selected show object
  const getSelectedShowDetails = () => {
    if (!event?.shows || !selectedShow) return null;
    return event.shows.find(show => show.showId === selectedShow);
  };

  // Handle show selection
  const handleShowSelect = (showId) => {
    setSelectedShow(showId);
    if (viewType === '3d') {
      setShowDetailModal(true);
    }
  };

  // Calculate remaining seats for a show
  const getRemainingSeats = (show) => {
    return event.capacity - (show.seatsBooked || 0);
  };

  // Get capacity status class
  const getCapacityStatusClass = (show) => {
    const remaining = getRemainingSeats(show);
    const percentage = (remaining / event.capacity) * 100;
    
    if (percentage <= 10) return 'bg-red-600 text-white';
    if (percentage <= 30) return 'bg-orange-500 text-white';
    if (percentage <= 50) return 'bg-yellow-500';
    return 'bg-green-500 text-white';
  };

  // Get background gradient based on show date (for list view)
  const getShowGradient = (show) => {
    const date = new Date(show.date);
    const day = date.getDate();
    
    // Create different gradient backgrounds based on date
    const gradients = [
      'from-indigo-500 to-purple-500',
      'from-blue-500 to-teal-500',
      'from-green-500 to-emerald-500',
      'from-amber-500 to-orange-500',
      'from-red-500 to-pink-500',
    ];
    
    return gradients[day % gradients.length];
  };

  // Rating stars for show detail
  const renderRatingStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-56 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
      <h2 className="text-xl font-bold mb-2">Error Loading Event</h2>
      <p>{error}</p>
      <Button className="mt-4" onClick={() => router.push('/customer/events')}>Back to Events</Button>
    </div>
  );
  
  if (!event) return null;

  // Sort shows by date/time
  const sortedShows = (event.shows || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime));
  const calendarDays = getCalendarDays(currentMonth, currentYear);
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });
  const selectedShowDetails = getSelectedShowDetails();

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <EntryPassManager />
      
      {/* Hero section with image and details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-2xl overflow-hidden shadow-xl mb-8"
      >
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold">{event.title}</h1>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-pink-500' : 'bg-white/20 hover:bg-white/30'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
                  </button>
                  <button className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center text-indigo-100 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.venue}</span>
              </div>
              
              <div className="flex items-center text-indigo-100 mb-6">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/20 rounded-full px-4 py-1 flex items-center backdrop-blur-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Capacity: {event.capacity}</span>
                </div>
                <div className="bg-white/20 rounded-full px-4 py-1 flex items-center backdrop-blur-sm">
                  <Tag className="w-4 h-4 mr-2" />
                  <span>₹{event.price}</span>
                </div>
                <div className="bg-white/20 rounded-full px-4 py-1 flex items-center backdrop-blur-sm">
                  {renderRatingStars(4.5)}
                </div>
              </div>
              
              <p className="text-indigo-50 mb-6">{event.description}</p>
              
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map(tag => (
                    <span key={tag} className="bg-white/10 rounded-full px-3 py-1 text-xs backdrop-blur-sm">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="md:w-1/3 flex items-center justify-center">
              {event.image ? (
                <motion.img 
                  src={event.image} 
                  alt={event.title} 
                  className="rounded-xl shadow-lg w-full h-56 md:h-64 object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              ) : (
                <div className="rounded-xl shadow-lg w-full h-56 md:h-64 flex items-center justify-center overflow-hidden">
                  <Canvas>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <EventLogo title={event.title} />
                  </Canvas>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Display shows */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-600" />
              Available Shows
            </h2>
            <div className="flex border rounded-lg overflow-hidden">
              <button 
                onClick={() => setViewType('calendar')} 
                className={`px-4 py-2 ${viewType === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewType('list')} 
                className={`px-4 py-2 ${viewType === 'list' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
              <button 
                onClick={() => setViewType('3d')} 
                className={`px-4 py-2 ${viewType === '3d' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
              </button>
            </div>
          </div>
        </div>
        
        {viewType === 'calendar' && (
          <div className="p-6">
            {/* Calendar navigation */}
            <div className="flex justify-between items-center mb-6">
              <motion.button 
                onClick={prevMonth} 
                className="p-2 rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.h3 
                className="text-xl font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={`${monthName}-${currentYear}`}
              >
                {monthName} {currentYear}
              </motion.h3>
              <motion.button 
                onClick={nextMonth} 
                className="p-2 rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Days of week */}
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="bg-gray-50 text-center py-2 font-medium text-gray-700">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const dateShows = getShowsForDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                
                return (
                  <motion.div 
                    key={index}
                    className={`
                      bg-white min-h-24 p-2 border border-gray-100
                      ${day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'} 
                      ${isToday ? 'bg-indigo-50' : ''}
                      transition-colors relative
                    `}
                    whileHover={{ scale: dateShows.length > 0 && day.isCurrentMonth ? 1.02 : 1 }}
                  >
                    <div className={`
                      text-sm font-medium mb-1 
                      ${isToday ? 'bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>
                    
                    {/* Shows for this day */}
                    <div className="space-y-1">
                      {dateShows.length > 0 ? (
                        dateShows.map(show => {
                          const isSelected = selectedShow === show.showId;
                          const remainingSeats = getRemainingSeats(show);
                          const capacityClass = getCapacityStatusClass(show);
                          
                          return (
                            <motion.div 
                              key={show.showId}
                              onClick={() => handleShowSelect(show.showId)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`
                                ${isSelected ? 'ring-2 ring-indigo-500' : ''} 
                                ${remainingSeats === 0 ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}
                                text-xs p-1 rounded cursor-pointer transition-colors flex flex-col
                                ${isSelected ? 'shadow-md' : ''}
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate flex-1">
                                  {formatTime(show.startTime)}
                                </span>
                                <span className={`px-1.5 py-0.5 text-[10px] rounded-sm ${capacityClass}`}>
                                  {remainingSeats}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : day.isCurrentMonth ? (
                        <div className="text-xs text-center text-gray-400">No shows</div>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-green-500 mr-2"></div>
                <span>Many seats</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-yellow-500 mr-2"></div>
                <span>Filling up</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-orange-500 mr-2"></div>
                <span>Almost full</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-red-600 mr-2"></div>
                <span>Few seats left</span>
              </div>
            </div>
          </div>
        )}
        
        {viewType === 'list' && (
          <div className="p-6">
            <div className="space-y-3">
              {sortedShows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No shows available for this event.</div>
              ) : (
                <AnimatePresence>
                  {sortedShows.map((show, index) => {
                    const isSelected = selectedShow === show.showId;
                    const remainingSeats = getRemainingSeats(show);
                    const capacityClass = getCapacityStatusClass(show);
                    const showDate = new Date(show.date);
                    const gradient = getShowGradient(show);
                    
                    return (
                      <motion.div 
                        key={show.showId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={() => handleShowSelect(show.showId)}
                        className={`
                          flex items-center justify-between p-4 rounded-lg border cursor-pointer
                          ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}
                          ${remainingSeats === 0 ? 'opacity-50' : ''}
                          transition-all
                        `}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} text-white flex flex-col items-center justify-center rounded-lg shadow-md`}>
                            <div className="text-xs font-medium">{showDate.toLocaleString('default', { month: 'short' })}</div>
                            <div className="text-lg font-bold">{showDate.getDate()}</div>
                          </div>
                          
                          <div>
                            <div className="font-medium">{formatTime(show.startTime)} - {formatTime(show.endTime)}</div>
                            <div className="text-sm text-gray-500">{showDate.toLocaleString('default', { weekday: 'long' })}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${capacityClass}`}>
                              {remainingSeats} seats left
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
        
        {viewType === '3d' && (
          <div className="p-6">
            <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gradient-to-b from-indigo-900 to-black">
              <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <ShowBubbles shows={sortedShows} onShowClick={handleShowSelect} />
              </Canvas>
              <div className="text-center py-2 text-white text-xs bg-indigo-900/80">
                Click on a bubble to select a show
              </div>
            </div>
          </div>
        )}
        
        {/* Booking button */}
        {sortedShows.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-500" />
                <span className="text-sm text-gray-600">Select a show to book tickets</span>
              </div>
              <Button 
                className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
                onClick={() => router.push(`/customer/events/${eventId}/book?showId=${selectedShow}`)} 
                disabled={!selectedShow}
              >
                <Ticket className="w-4 h-4 mr-2" />
                Book Selected Show
              </Button>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Show details modal */}
      {showDetailModal && selectedShowDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Show Details</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-lg mb-4">
                <div className="text-sm opacity-80">Date & Time</div>
                <div className="text-xl font-semibold">{new Date(selectedShowDetails.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                <div className="mt-1 font-medium">{formatTime(selectedShowDetails.startTime)} - {formatTime(selectedShowDetails.endTime)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="text-xs text-indigo-600">Venue</div>
                  <div className="font-medium">{event.venue}</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="text-xs text-indigo-600">Capacity</div>
                  <div className="font-medium">{getRemainingSeats(selectedShowDetails)} / {event.capacity}</div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg mb-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-green-600">Price per Ticket</div>
                  <div className="text-xl font-bold">₹{event.price}</div>
                </div>
                <div className="text-green-600 text-sm">
                  <div className="text-right">Available</div>
                  <div className="font-bold">{getRemainingSeats(selectedShowDetails)} seats</div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
              onClick={() => {
                setShowDetailModal(false);
                router.push(`/customer/events/${eventId}/book?showId=${selectedShow}`);
              }}
            >
              <Ticket className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          </motion.div>
        </div>
      )}
      
      {/* Features & Terms */}
      {(event.features?.length > 0 || event.terms) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {event.features?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-4">Event Features</h3>
              <ul className="space-y-2">
                {event.features.map((feature, idx) => (
                  <motion.li 
                    key={idx} 
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          
          {event.terms && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-4">Terms & Conditions</h3>
              <div className="text-gray-600 text-sm space-y-2">
                {event.terms.split('\n').map((paragraph, idx) => (
                  <motion.p 
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
} 