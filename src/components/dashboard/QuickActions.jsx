import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export function QuickActions({ actions }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          className="block"
        >
          <Card className="h-full transition-colors hover:bg-gray-50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <action.icon
                  className="h-12 w-12 text-gray-400"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  {action.name}
                </h3>
                {action.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {action.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 