"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex gap-6 justify-center mb-8">
        <Link href="/customer/events" className={pathname.startsWith("/customer/events") ? "font-bold text-blue-600" : ""}>Events</Link>
        <Link href="/customer/tickets" className={pathname.startsWith("/customer/tickets") ? "font-bold text-blue-600" : ""}>My Tickets</Link>
        <Link href="/customer/profile" className={pathname.startsWith("/customer/profile") ? "font-bold text-blue-600" : ""}>Profile</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
} 