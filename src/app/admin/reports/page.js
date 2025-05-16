'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', timeRange],
    queryFn: async () => {
      const response = await api.get(`/admin/stats?timeRange=${timeRange}`);
      const data = response.data || {};
      
      // Ensure all required properties exist
      return {
        ticketSales: Array.isArray(data.ticketSales) ? data.ticketSales : [],
        revenue: Array.isArray(data.revenue) ? data.revenue : [],
        eventDistribution: Array.isArray(data.eventDistribution) ? data.eventDistribution : [],
        topEvents: Array.isArray(data.topEvents) ? data.topEvents : [],
        totalRevenue: data.totalRevenue || 0,
        totalTicketsSold: data.totalTicketsSold || 0,
        activeEvents: data.activeEvents || 0
      };
    },
  });

  const safeFormat = (date) => {
    try {
      return format(new Date(date), 'MMM d');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Ensure we have data to display
  const hasTicketSales = stats?.ticketSales?.length > 0;
  const hasRevenue = stats?.revenue?.length > 0;
  const hasEventDistribution = stats?.eventDistribution?.length > 0;
  const hasTopEvents = stats?.topEvents?.length > 0;

  const ticketSalesData = {
    labels: stats?.ticketSales?.map(sale => safeFormat(sale.date)) || [],
    datasets: [
      {
        label: 'Tickets Sold',
        data: stats?.ticketSales?.map(sale => sale.count || 0) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const revenueData = {
    labels: stats?.revenue?.map(rev => safeFormat(rev.date)) || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: stats?.revenue?.map(rev => rev.amount || 0) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
    ],
  };

  const eventDistributionData = {
    labels: stats?.eventDistribution?.map(event => event.title || 'Untitled') || [],
    datasets: [
      {
        data: stats?.eventDistribution?.map(event => event.ticketsSold || 0) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            View event and ticket statistics.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold">Total Revenue</h2>
          <p className="text-3xl font-bold mt-2">
            ${stats?.totalRevenue?.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {timeRange === 'week' ? 'This week' :
             timeRange === 'month' ? 'This month' :
             'This year'}
          </p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold">Tickets Sold</h2>
          <p className="text-3xl font-bold mt-2">
            {stats?.totalTicketsSold}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {timeRange === 'week' ? 'This week' :
             timeRange === 'month' ? 'This month' :
             'This year'}
          </p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold">Active Events</h2>
          <p className="text-3xl font-bold mt-2">
            {stats?.activeEvents}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Currently active
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Ticket Sales</h2>
          {hasTicketSales ? (
            <Line
              data={ticketSalesData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground">No ticket sales data available</div>
          )}
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Revenue</h2>
          {hasRevenue ? (
            <Bar
              data={revenueData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground">No revenue data available</div>
          )}
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Event Distribution</h2>
          {hasEventDistribution ? (
            <div className="h-64">
              <Pie
                data={eventDistributionData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">No event distribution data available</div>
          )}
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Top Events</h2>
          {hasTopEvents ? (
            <div className="space-y-4">
              {stats.topEvents.map((event, index) => (
                <div
                  key={event._id || index}
                  className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">
                      {event.title || 'Untitled Event'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {event.ticketsSold || 0} tickets sold
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(event.revenue || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">No top events data available</div>
          )}
        </div>
      </div>
    </div>
  );
} 