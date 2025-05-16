'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

export default function StaffDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['staff-stats'],
    queryFn: async () => {
      const response = await api.get('/staff/stats');
      return response.data;
    },
  });

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats?.totalTickets || 0,
      href: '/staff/tickets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
      ),
    },
    {
      title: 'Tickets Verified',
      value: stats?.verifiedTickets || 0,
      href: '/staff/tickets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Today\'s Tickets',
      value: stats?.todaysTickets || 0,
      href: '/staff/tickets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the staff dashboard. Here's an overview of your tickets.</p>
      </div>

      {isLoading ? (
        <div className="grid place-items-center h-64">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <Link 
              key={index} 
              href={card.href}
              className="bg-background border border-border rounded-lg p-6 hover:border-primary/50 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6">
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Ticket Verifications</h2>
            <Link 
              href="/staff/scan"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Scan Tickets
            </Link>
          </div>
          
          {isLoading ? (
            <div className="h-64 grid place-items-center">
              <div className="h-8 w-8 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
          ) : stats?.recentVerifications?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Ticket ID</th>
                    
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Verified At</th>
                    <th className="text-left py-3 px-4 font-medium">sStatus</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentVerifications.map((verification) => (
                    <tr key={verification.id} className="border-b border-border hover:bg-secondary/20">
                      <td className="py-3 px-4">{verification.ticketId}</td>
                     
                      <td className="py-3 px-4">{verification.user}</td>
                      <td className="py-3 px-4">{new Date(verification.verifiedAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          verification.status === 'verified' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : verification.status === 'invalid'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {verification.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-64 grid place-items-center text-muted-foreground">
              No recent verifications found
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 