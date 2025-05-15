import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { QrCodeIcon } from '@heroicons/react/24/outline'

export function TicketCard({ ticket }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ticket #{ticket.ticketNumber}</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            ticket.status === 'active' ? 'bg-green-100 text-green-800' :
            ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {ticket.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Event Details</h4>
            <p className="mt-1 text-sm text-gray-500">{ticket.event.name}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(ticket.event.startDate), 'MMM d, yyyy h:mm a')}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900">Attendees</h4>
            <ul className="mt-1 space-y-1">
              {ticket.attendees.map((attendee, index) => (
                <li key={index} className="text-sm text-gray-500">
                  {attendee.name} ({attendee.age} years)
                </li>
              ))}
            </ul>
          </div>

          {ticket.qrCode && (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <img
                src={ticket.qrCode}
                alt="Ticket QR Code"
                className="w-32 h-32"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Price</span>
            <span className="font-medium text-gray-900">₹{ticket.price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 