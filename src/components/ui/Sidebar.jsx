'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  Users, 
  BarChart2, 
  QrCode, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  X,
  Shield,
  User
} from 'lucide-react';

export default function Sidebar({ role = 'admin' }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle responsive collapse and mobile menu
  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
        setMobileOpen(false);
      } else {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Navigation items based on role
  const adminNavItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard size={20} />
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: <Calendar size={20} />
    },
    {
      name: 'Tickets',
      href: '/admin/tickets',
      icon: <Ticket size={20} />
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: <Users size={20} />
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: <BarChart2 size={20} />
    },
    {
      name: 'Scan Tickets',
      href: '/admin/scan',
      icon: <QrCode size={20} />
    },
  ];

  const staffNavItems = [
    {
      name: 'Dashboard',
      href: '/staff',
      icon: <LayoutDashboard size={20} />
    },
    {
      name: 'Tickets',
      href: '/staff/tickets',
      icon: <Ticket size={20} />
    },
    {
      name: 'Scan Tickets',
      href: '/staff/scan',
      icon: <QrCode size={20} />
    },
  ];

  const navItems = role === 'admin' ? adminNavItems : staffNavItems;

  // Check if a path is active
  const isActive = (path) => {
    if (path === '/admin' || path === '/staff') {
      // For dashboard, only match exact path
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  // Role badge style
  const getRoleBadgeStyle = () => {
    if (user?.role === 'admin') {
      return 'bg-red-100 text-red-800';
    }
    if (user?.role === 'staff') {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 p-2 rounded-md bg-white shadow-md z-10 lg:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside 
        className={`bg-white fixed inset-y-0 left-0 shadow-md z-30 flex flex-col transition-all duration-300 ease-in-out
          ${mobileOpen ? 'transform-none' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-16 lg:w-20' : 'w-64'}`
        }
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold">
                {collapsed ? 'S' : 'SC'}
              </div>
              {!collapsed && (
                <span className="text-base font-medium text-gray-900 ml-3">ScienceCity</span>
              )}
            </div>
            
            <div className="flex items-center">
              {/* Mobile close button */}
              {mobileOpen && (
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 lg:hidden"
                >
                  <X size={18} />
                </button>
              )}
              
              {/* Collapse/expand button */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hidden lg:block"
              >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-colors
                        ${active
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <span className={`flex-shrink-0 ${active ? 'text-blue-600' : ''}`}>
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="ml-3 whitespace-nowrap">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="mt-auto border-t border-gray-100 p-4">
            {/* User profile - Always show avatar */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : ''} mb-4`}>
              {user && (
                <>
                  <div className={`
                    flex-shrink-0 h-9 w-9 rounded-full ${getRoleBadgeStyle()}
                    flex items-center justify-center text-sm font-medium
                  `}>
                    {getInitials(user.name)}
                  </div>
                  
                  {!collapsed && (
                    <div className="ml-3 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <div className="flex items-center">
                        <p className="text-xs text-gray-500 truncate mr-2">{user.email}</p>
                        <span className={`
                          text-xs px-1.5 py-0.5 rounded ${getRoleBadgeStyle()}
                        `}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Bottom actions */}
            <div className={`flex ${collapsed ? 'flex-col' : 'justify-between'} items-center space-y-2`}>
              <div className={collapsed ? 'mb-2' : ''}>
                <ThemeToggle />
              </div>
              
              {user && (
                <button
                  onClick={logout}
                  className={`
                    flex items-center ${collapsed ? 'justify-center w-9 h-9' : 'px-2.5 py-1.5'} 
                    text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors
                  `}
                >
                  <LogOut size={collapsed ? 18 : 16} className={collapsed ? '' : 'mr-1.5'} />
                  {!collapsed && <span className="text-xs font-medium">Sign Out</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content wrapper to create proper spacing */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        {/* This empty div just ensures proper margin/layout */}
      </div>
    </>
  );
}