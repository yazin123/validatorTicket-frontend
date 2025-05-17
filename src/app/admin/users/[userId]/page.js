'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

export default function UserDetailsPage() {
  const { userId } = useParams();
  const router = useRouter();

  const { data: user, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    },
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['admin-user-tickets', userId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${userId}/tickets`);
      return response.data;
    },
  });

  const handleRoleChange = async (newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      refetchUser();
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      refetchUser();
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Error updating user status:', error);
    }
  };

  const isLoading = userLoading || ticketsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The requested user could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Details</h1>
          <p className="text-muted-foreground mt-1">
            View and manage user information.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back to Users
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">User Information</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Role</dt>
              <dd className="mt-1">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="px-2 py-1 border border-border rounded-md bg-background"
                >
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2 py-1 border border-border rounded-md bg-background"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Joined</dt>
              <dd className="mt-1 font-medium">
                {format(new Date(user.createdAt), 'PPP')}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Recent Tickets</h2>
          {tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="border border-border rounded-lg p-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {ticket.event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{ticket.ticketNumber}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      ticket.status === 'used' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Date: {format(new Date(ticket.event.date), 'PPP')}</p>
                    <p>Price: ₹{ticket.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tickets found.</p>
          )}
        </div>
      </div>
    </div>
  );
} 