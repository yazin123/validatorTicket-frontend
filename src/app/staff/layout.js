'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';

export default function StaffLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protect staff routes
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'staff' && user.role !== 'admin'))) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex h-screen">
      <Sidebar role="staff" />
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 