'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ExhibitionsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: exhibitions, isLoading, refetch } = useQuery({
    queryKey: ['admin-exhibitions'],
    queryFn: async () => {
      const response = await api.get('/exhibitions');
      return response.data;
    },
  });

  const handleStatusChange = async (exhibitionId, newStatus) => {
    try {
      await api.put(`/exhibitions/${exhibitionId}/status`, { status: newStatus });
      refetch();
      toast.success('Exhibition status updated successfully');
    } catch (error) {
      toast.error('Failed to update exhibition status');
      console.error('Error updating exhibition status:', error);
    }
  };

  const filteredExhibitions = exhibitions?.data.filter(exhibition => 
    exhibition.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exhibition.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exhibition Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage science exhibitions and displays.
          </p>
        </div>
        <Link href="/admin/exhibitions/new">
          <Button>Create New Exhibition</Button>
        </Link>
      </div>

      <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Exhibitions</h2>
          <div className="w-64">
            <input
              type="search"
              placeholder="Search exhibitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Visitors</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExhibitions.map((exhibition) => (
                  <tr key={exhibition._id} className="border-b border-border hover:bg-secondary/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{exhibition.title}</div>
                      <div className="text-sm text-muted-foreground">{exhibition.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {exhibition.startDate && format(new Date(exhibition.startDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        to {exhibition.endDate && format(new Date(exhibition.endDate), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{exhibition.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={exhibition.status}
                        onChange={(e) => handleStatusChange(exhibition._id, e.target.value)}
                        className="px-2 py-1 border border-border rounded-md bg-background"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {exhibition.visitorCount || 0} visitors
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {exhibition.maxCapacity ? `Max: ${exhibition.maxCapacity}` : 'No limit'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link href={`/admin/exhibitions/${exhibition._id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/exhibitions/${exhibition._id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/admin/exhibitions/${exhibition._id}/events`}>
                          <Button variant="outline" size="sm">
                            Events
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 