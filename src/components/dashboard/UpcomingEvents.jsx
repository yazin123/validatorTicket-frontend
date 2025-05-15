import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export function UpcomingEvents({ events }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event._id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-12 w-12 rounded-lg object-cover"
                      src={event.image || '/placeholder-event.jpg'}
                      alt={event.name}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {event.name}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {format(new Date(event.startDate), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {event.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {events.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No upcoming events
          </p>
        )}
      </CardContent>
    </Card>
  )
} 