'use client';

import { Suspense } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient();

export default function AdminLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar role="admin" />
          
          <main className="flex-1 p-0 lg:p-6 transition-all duration-300 ease-in-out">
            <div className="max-w- mx-auto">
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
              }>
                {children}
              </Suspense>
            </div>
          </main>
          
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'white',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
} 