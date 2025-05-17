'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Search, User, Shield, AlertCircle, ChevronDown,
  UserPlus, Download, Filter, CheckCheck, X, Clock
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const limit = 12; // Number of users per page

  // Fetch users data with pagination
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page, limit],
    queryFn: async () => {
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      return response.data;
    },
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, pages: 1, limit };

  // User role management
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      refetch();
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    }
  };

  // User status management
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      refetch();
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Error updating user status:', error);
    }
  };

  // Filter and sort users based on search term, tab, and sort options
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    let filtered = users.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (currentTab !== 'all') {
      if (currentTab === 'active') filtered = filtered.filter(user => user.status === 'active');
      else if (currentTab === 'suspended') filtered = filtered.filter(user => user.status === 'suspended');
      else if (currentTab === 'admin') filtered = filtered.filter(user => user.role === 'admin');
      else if (currentTab === 'staff') filtered = filtered.filter(user => user.role === 'staff');
      else if (currentTab === 'user') filtered = filtered.filter(user => user.role === 'user');
    }
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'email') comparison = a.email.localeCompare(b.email);
      else if (sortBy === 'role') comparison = a.role.localeCompare(b.role);
      else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [users, searchTerm, currentTab, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!users) return { total: 0, active: 0, suspended: 0, admin: 0, staff: 0, user: 0 };
    
    return {
      total: users.length,
      active: users.filter(user => user.status === 'active').length,
      suspended: users.filter(user => user.status === 'suspended').length,
      admin: users.filter(user => user.role === 'admin').length,
      staff: users.filter(user => user.role === 'staff').length,
      user: users.filter(user => user.role === 'user').length,
    };
  }, [users]);

  // UI utility functions
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? 
      <CheckCheck size={14} className="text-green-600" /> : 
      <Clock size={14} className="text-orange-600" />;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={14} className="text-red-600" />;
      case 'staff':
        return <Shield size={14} className="text-blue-600" />;
      default:
        return <User size={14} className="text-gray-600" />;
    }
  };

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  // Get background color for avatar based on user role
  const getAvatarColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100';
      case 'staff':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Pagination controls
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(p + 1, pagination.pages));

  return (
    <div className="space-y-6 p-6 max-w-9xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button size="sm" variant="default">
          <Link className='flex items-center' href="/admin/users/add">
          <UserPlus size={16} className="mr-2" />
          Add User</Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Users</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Active</div>
            <div className="text-2xl font-bold mt-1 flex items-center">
              {stats.active}
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Suspended</div>
            <div className="text-2xl font-bold mt-1 flex items-center">
              {stats.suspended}
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Admins</div>
            <div className="text-2xl font-bold mt-1 text-red-600">{stats.admin}</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Staff</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{stats.staff}</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Regular Users</div>
            <div className="text-2xl font-bold mt-1 text-gray-600">{stats.user}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4 md:mb-0">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="user">Regular</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    Name {sortBy === 'name' && <ChevronDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('email')}>
                    Email {sortBy === 'email' && <ChevronDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('role')}>
                    Role {sortBy === 'role' && <ChevronDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('status')}>
                    Status {sortBy === 'status' && <ChevronDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    Order: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user._id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className={`h-12 w-12 ${getAvatarColor(user.role)}`}>
                        <span className="text-lg font-medium">{getInitials(user.name)}</span>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold truncate">{user.name}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => window.location.href = `/admin/users/${user._id}`}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'user')}>
                                Regular User {user.role === 'user' && <CheckCheck className="ml-2 h-4 w-4" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'staff')}>
                                Staff {user.role === 'staff' && <CheckCheck className="ml-2 h-4 w-4" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'admin')}>
                                Admin {user.role === 'admin' && <CheckCheck className="ml-2 h-4 w-4" />}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleStatusChange(user._id, 'active')}>
                                Active {user.status === 'active' && <CheckCheck className="ml-2 h-4 w-4" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(user._id, 'suspended')}>
                                Suspended {user.status === 'suspended' && <CheckCheck className="ml-2 h-4 w-4" />}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className={`${getRoleColor(user.role)} flex items-center gap-1 px-2 py-0.5`}>
                            {getRoleIcon(user.role)}
                            {user.role}
                          </Badge>
                          <Badge variant="outline" className={`${getStatusColor(user.status)} flex items-center gap-1 px-2 py-0.5`}>
                            {getStatusIcon(user.status)}
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 p-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/admin/users/${user._id}`}
                    >
                      View Profile
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions <ChevronDown size={14} className="ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user._id}/edit`}>
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'suspended' : 'active')}>
                          {user.status === 'active' ? 'Suspend User' : 'Activate User'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {filteredUsers.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <AlertCircle size={36} className="mb-3 text-gray-400" />
              <h3 className="text-lg font-medium mb-1">{searchTerm ? "No matching users found" : "No users available"}</h3>
              <p className="text-center max-w-md">
                {searchTerm 
                  ? `We couldn't find any users matching "${searchTerm}". Try adjusting your search terms.` 
                  : "There are no users in this category. Users added to the system will appear here."}
              </p>
              {searchTerm && (
                <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
        
        {filteredUsers.length > 0 && !isLoading && (
          <CardFooter className="py-4 px-6 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{stats.total}</span> users
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handlePrevPage}
          disabled={pagination.page === 1}
          className="px-4 py-2 mx-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 mx-1">Page {pagination.page} of {pagination.pages}</span>
        <button
          onClick={handleNextPage}
          disabled={pagination.page === pagination.pages}
          className="px-4 py-2 mx-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}