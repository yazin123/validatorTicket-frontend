'use client';

import CustomerHeader from '@/components/ui/CustomerHeader';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CustomerHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 