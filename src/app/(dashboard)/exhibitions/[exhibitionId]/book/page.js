'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { format } from 'date-fns'

export default function BookTicketPage() {
  const { exhibitionId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [exhibition, setExhibition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    quantity: 1,
    attendees: [{ name: '', email: '', phone: '' }]
  })

  useEffect(() => {
    if (user) {
      // Pre-fill the first attendee with user info
      setFormData(prev => ({
        ...prev,
        attendees: [
          { name: user.name || '', email: user.email || '', phone: user.phone || '' },
          ...prev.attendees.slice(1)
        ]
      }))
    }
    
    fetchExhibitionDetails()
  }, [exhibitionId, user])

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

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value, 10)
    if (isNaN(quantity) || quantity < 1) return
    
    // Update attendees array size based on quantity
    const newAttendees = [...formData.attendees]
    if (quantity > newAttendees.length) {
      // Add more attendee slots
      for (let i = newAttendees.length; i < quantity; i++) {
        newAttendees.push({ name: '', email: '', phone: '' })
      }
    } else if (quantity < newAttendees.length) {
      // Remove extra attendee slots
      newAttendees.splice(quantity)
    }
    
    setFormData({
      ...formData,
      quantity,
      attendees: newAttendees
    })
  }

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...formData.attendees]
    newAttendees[index] = {
      ...newAttendees[index],
      [field]: value
    }
    
    setFormData({
      ...formData,
      attendees: newAttendees
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Prepare booking data
      const bookingData = {
        exhibitionId,
        quantity: formData.quantity,
        attendees: formData.attendees
      }
      
      // Submit booking
      const response = await api.post('/tickets/book', bookingData)
      
      toast.success('Tickets booked successfully!')
      
      // Redirect to ticket details
      router.push(`/tickets/${response.data._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book tickets')
      console.error('Booking error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please sign in to book tickets.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
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

  const totalPrice = formData.quantity * exhibition.ticketPrice

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Exhibitions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Book Tickets</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Number of Tickets</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    required
                  />
                </div>
                
                {formData.attendees.map((attendee, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <h3 className="font-medium mb-3">Attendee {index + 1}</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`name-${index}`}>Full Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={attendee.name}
                          onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={attendee.email}
                          onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                        <Input
                          id={`phone-${index}`}
                          value={attendee.phone}
                          onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : `Complete Booking - $${totalPrice.toFixed(2)}`}
                </Button>
              </div>
            </Card>
          </form>
        </div>
        
        <div>
          <Card className="p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Exhibition Details</h2>
            {exhibition.imageUrl && (
              <img 
                src={exhibition.imageUrl} 
                alt={exhibition.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{exhibition.title}</h3>
              <p className="text-sm text-gray-600">{exhibition.description}</p>
              <div className="text-sm">
                <p><span className="font-semibold">Dates:</span> {format(new Date(exhibition.startDate), 'MMM d, yyyy')} - {format(new Date(exhibition.endDate), 'MMM d, yyyy')}</p>
                <p><span className="font-semibold">Location:</span> {exhibition.location}</p>
                <p><span className="font-semibold">Price per Ticket:</span> ${exhibition.ticketPrice}</p>
              </div>
              <div className="border-t pt-3 mt-3">
                <p className="font-semibold">Order Summary</p>
                <div className="flex justify-between mt-2">
                  <span>Tickets ({formData.quantity})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-3 text-lg">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 