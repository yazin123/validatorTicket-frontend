'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  // Handle protected routes
  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

      if (!user && !isPublicPath) {
        // router.replace('/login');
      } else if (user && isPublicPath && pathname !== '/auth/callback') {
        const redirectTo = user.role === 'admin' ? '/admin' : '/dashboard';
        router.replace(redirectTo);
      }
    }
  }, [user, loading, pathname, router]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/auth/me');
        setUser(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, user } = data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || ''}/auth/google`;
  };

  const processGoogleCallback = async (token) => {
    try {
      if (!token) {
        throw new Error('No token provided');
      }
      
      // Set the token in local storage and API headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      return { success: true };
    } catch (error) {
      console.error('Google auth callback processing failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    router.replace('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    handleGoogleAuth,
    processGoogleCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}