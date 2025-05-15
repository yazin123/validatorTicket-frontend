// 'use client'

// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { useAuth } from '@/contexts/AuthContext'
// import {Card} from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { toast } from 'react-hot-toast'
// import QrScanner from 'react-qr-scanner'
// import api from '@/lib/api'

// export default function EventScanPage() {
//   const { eventId } = useParams()
//   const router = useRouter()
//   const { user } = useAuth()
//   const [event, setEvent] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [scanning, setScanning] = useState(false)
//   const [verificationResult, setVerificationResult] = useState(null)

//   useEffect(() => {
//     fetchEventDetails()
//   }, [eventId])

//   const fetchEventDetails = async () => {
//     try {
//       const { data } = await api.get(`/events/${eventId}`)
//       setEvent(data)
//     } catch (error) {
//       toast.error('Failed to fetch event details')
//       console.error('Error fetching event details:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleScan = async (result) => {
//     if (result && result.text) {
//       setScanning(false)
//       try {
//         const { data } = await api.post(`/tickets/verify`, {
//           ticketNumber: result.text,
//           eventId
//         })
//         setVerificationResult(data)
//         toast.success('Ticket verified successfully')
//       } catch (error) {
//         setVerificationResult({
//           valid: false,
//           message: error.response?.data?.message || 'Invalid ticket'
//         })
//         toast.error(error.response?.data?.message || 'Failed to verify ticket')
//       }
//     }
//   }

//   const handleError = (error) => {
//     console.error('QR Scanner error:', error)
//     toast.error('Error accessing camera')
//   }

//   if (!user || user.role !== 'admin') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-lg">Access denied. Admin privileges required.</p>
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-lg">Loading...</p>
//       </div>
//     )
//   }

//   if (!event) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-lg">Event not found.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-6">
//         <Button variant="outline" onClick={() => router.back()}>
//           Back to Event
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card className="p-6">
//           <h2 className="text-xl font-bold mb-4">Event Information</h2>
//           <div className="space-y-2">
//             <p><span className="font-semibold">Title:</span> {event.title}</p>
//             <p><span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
//             <p><span className="font-semibold">Time:</span> {new Date(event.date).toLocaleTimeString()}</p>
//             <p><span className="font-semibold">Location:</span> {event.location}</p>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <h2 className="text-xl font-bold mb-4">Ticket Scanner</h2>
//           <div className="space-y-4">
//             {scanning ? (
//               <div className="aspect-square max-w-md mx-auto">
//                 <QrScanner
//                   delay={300}
//                   onError={handleError}
//                   onScan={handleScan}
//                   style={{ width: '100%' }}
//                 />
//               </div>
//             ) : (
//               <div className="text-center">
//                 <Button onClick={() => setScanning(true)}>
//                   Start Scanning
//                 </Button>
//               </div>
//             )}

//             {verificationResult && (
//               <div className={`mt-4 p-4 rounded-lg ${verificationResult.valid ? 'bg-green-50' : 'bg-red-50'}`}>
//                 <p className={`font-medium ${verificationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
//                   {verificationResult.message}
//                 </p>
//                 {verificationResult.attendee && (
//                   <div className="mt-2 text-sm">
//                     <p><span className="font-semibold">Name:</span> {verificationResult.attendee.name}</p>
//                     <p><span className="font-semibold">Email:</span> {verificationResult.attendee.email}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </Card>
//       </div>
//     </div>
//   )
// } 