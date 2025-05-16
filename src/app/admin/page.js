'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
  });

  const statCards = [
    {
      title: 'Total Exhibitions',
      value: stats?.exhibitions || 0,
      href: '/admin/exhibitions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      ),
    },
    {
      title: 'Total Events',
      value: stats?.events || 0,
      href: '/admin/events',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      title: 'Total Tickets',
      value: stats?.tickets || 0,
      href: '/admin/tickets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
      ),
    },
    {
      title: 'Total Users',
      value: stats?.users || 0,
      href: '/admin/users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the admin dashboard. Here's an overview of your system.</p>
      </div>

      {isLoading ? (
        <div className="grid place-items-center h-64">
          <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Recent Exhibitions</h2>
          {isLoading ? (
            <div className="h-64 grid place-items-center">
              <div className="h-8 w-8 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
          ) : stats?.recentExhibitions?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentExhibitions.map((exhibition) => (
                <div key={exhibition.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{exhibition.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm bg-secondary px-2 py-1 rounded">
                    {exhibition.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 grid place-items-center text-muted-foreground">
              No exhibitions found
            </div>
          )}
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Recent Tickets</h2>
          {isLoading ? (
            <div className="h-64 grid place-items-center">
              <div className="h-8 w-8 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
          ) : stats?.recentTickets?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{ticket.exhibition}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.user} • {new Date(ticket.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-sm px-2 py-1 rounded ${
                    ticket.status === 'used' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : ticket.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {ticket.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 grid place-items-center text-muted-foreground">
              No tickets found
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 