import React from 'react'
import { cn } from '@/lib/utils'

export function Alert({
  variant = 'default',
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        {
          'bg-gray-50 text-gray-800 border-gray-200': variant === 'default',
          'bg-red-50 text-red-800 border-red-200': variant === 'error',
          'bg-green-50 text-green-800 border-green-200': variant === 'success',
          'bg-yellow-50 text-yellow-800 border-yellow-200': variant === 'warning',
          'bg-blue-50 text-blue-800 border-blue-200': variant === 'info',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertTitle({ className, children, ...props }) {
  return (
    <h5
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  )
}

export function AlertDescription({ className, children, ...props }) {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  )
} 