'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { format } from 'date-fns'
import { CalendarIcon, MapPinIcon, TagIcon } from '@heroicons/react/24/outline'

export default function ExhibitionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [exhibitions, setExhibitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchExhibitions()
  }, [])

  async function fetchExhibitions() {
    try {
      const { data } = await api.get('/exhibitions')
      setExhibitions(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to fetch exhibitions')
      console.error('Error fetching exhibitions:', error)
      setExhibitions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredExhibitions = exhibitions.filter(exhibition => {
    const searchLower = searchTerm.toLowerCase()
    return (
      exhibition.title.toLowerCase().includes(searchLower) ||
      exhibition.description.toLowerCase().includes(searchLower) ||
      exhibition.location.toLowerCase().includes(searchLower)
    )
  })

  const handleBookTicket = (exhibitionId) => {
    router.push(`/exhibitions/${exhibitionId}/book`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading exhibitions...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exhibitions & Events</h1>
        <input
          type="text"
          placeholder="Search exhibitions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {filteredExhibitions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No exhibitions found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibitions.map((exhibition) => (
            <Card key={exhibition._id} className="overflow-hidden">
              {exhibition.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={exhibition.imageUrl}
                    alt={exhibition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{exhibition.title}</h3>
                <div className="space-y-2 mb-4">
                  <p className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(new Date(exhibition.startDate), 'MMM d, yyyy')} - {format(new Date(exhibition.endDate), 'MMM d, yyyy')}
                  </p>
                  <p className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {exhibition.location}
                  </p>
                  <p className="flex items-center text-sm text-gray-500">
                    <TagIcon className="h-4 w-4 mr-2" />
                    ${exhibition.ticketPrice}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {exhibition.description}
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => handleBookTicket(exhibition._id)}
                >
                  Book Tickets
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 