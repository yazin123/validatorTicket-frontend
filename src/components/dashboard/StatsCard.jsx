import { Card, CardContent } from '@/components/ui/card'

export function StatsCard({ title, value, icon: Icon, description }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
              {description && (
                <dd className="text-sm text-gray-500">
                  {description}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 