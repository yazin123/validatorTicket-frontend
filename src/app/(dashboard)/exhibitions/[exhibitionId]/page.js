'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { format } from 'date-fns'
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  TicketIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

export default function ExhibitionDetailsPage() {
  const { exhibitionId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [exhibition, setExhibition] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExhibitionDetails()
  }, [exhibitionId])

  async function fetchExhibitionDetails() {
    try {
      const { data } = await api.get(`/exhibitions/${exhibitionId}`)
      setExhibition(data)
    } catch (error) {
      toast.error('Failed to fetch exhibition details')
      console.error('Error fetching exhibition:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookTickets = () => {
    router.push(`/exhibitions/${exhibitionId}/book`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading exhibition details...</p>
      </div>
    )
  }

  if (!exhibition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Exhibition not found.</p>
      </div>
    )
  }

  // Format dates
  const startDate = new Date(exhibition.startDate)
  const endDate = new Date(exhibition.endDate)
  const formattedDateRange = `${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}`
  
  // Opening hours display
  const openingHours = exhibition.openingHours || '9:00 AM - 6:00 PM'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Exhibitions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {exhibition.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={exhibition.imageUrl}
                alt={exhibition.title}
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold mb-4">{exhibition.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start space-x-3">
              <CalendarIcon className="h-6 w-6 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-500">{formattedDateRange}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPinIcon className="h-6 w-6 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-500">{exhibition.location}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <ClockIcon className="h-6 w-6 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Opening Hours</p>
                <p className="text-sm text-gray-500">{openingHours}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CurrencyDollarIcon className="h-6 w-6 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ticket Price</p>
                <p className="text-sm text-gray-500">${exhibition.ticketPrice}</p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-2">About the Exhibition</h2>
            <p>{exhibition.description}</p>
          </div>

          {exhibition.highlights && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Highlights</h2>
              <ul className="space-y-2">
                {exhibition.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 mr-3">
                      {index + 1}
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exhibition.artists && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Featured Artists</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exhibition.artists.map((artist, index) => (
                  <Card key={index} className="p-4">
                    {artist.imageUrl && (
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                      />
                    )}
                    <h3 className="text-lg font-medium text-center">{artist.name}</h3>
                    <p className="text-sm text-gray-500 text-center">{artist.specialty}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Card className="p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Book Your Tickets</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span>Ticket Price:</span>
                <span className="font-semibold">${exhibition.ticketPrice}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Available
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Exhibition Ends:</span>
                <span>{format(endDate, 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            <Button className="w-full" size="lg" onClick={handleBookTickets}>
              Book Tickets
            </Button>
            
            <div className="mt-6 text-sm text-gray-500">
              <p className="flex items-center mb-2">
                <TicketIcon className="h-4 w-4 mr-2" />
                E-tickets will be sent to your email
              </p>
              <p className="flex items-center mb-2">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Special group rates available
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 