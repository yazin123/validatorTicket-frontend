import { NextResponse } from 'next/server'
import api from '@/lib/api'

export async function POST(request) {
  try {
    const { qrData } = await request.json()
    
    if (!qrData) {
      return NextResponse.json(
        { message: 'QR code data is required' },
        { status: 400 }
      )
    }

    const response = await api.post('/tickets/verify', { qrData })
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Ticket verification error:', error)
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to verify ticket' },
      { status: error.response?.status || 500 }
    )
  }
} 