"use client"

import * as React from "react"

const Switch = React.forwardRef(({ checked, onCheckedChange, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked || false}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
        ${checked ? 'bg-indigo-600' : 'bg-gray-200'} 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className || ''}`}
      {...props}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform 
          ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch } 