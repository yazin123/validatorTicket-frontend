// lib/utils/index.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine multiple class names with tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to a readable string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  const mergedOptions = { ...defaultOptions, ...options }
  return new Date(date).toLocaleDateString('en-US', mergedOptions)
}

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Generate initials from name
 */
export function getInitials(name) {
  if (!name) return ''
  const names = name.split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
}