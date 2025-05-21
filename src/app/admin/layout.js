'use client';

import { Suspense, useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

// Create a client
const queryClient = new QueryClient();

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle component mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle sidebar toggle for mobile
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="sticky top-0 z-20 flex items-center p-4 bg-white border-b border-gray-200 lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 flex items-center">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white font-bold">
                SC
              </div>
              <span className="text-base font-medium text-gray-900 ml-2">ScienceCity</span>
            </div>
          </div>

          {/* Pass the mobile menu state to Sidebar */}
          <Sidebar 
            role="admin" 
            mobileOpen={mobileMenuOpen} 
            setMobileOpen={setMobileMenuOpen} 
          />
          
          <main className="flex-1 p-4 pt-6 lg:p-6 transition-all duration-300 ease-in-out">
            <div className="max-w-full mx-auto">
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="h-12 w-12 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
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