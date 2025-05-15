'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings')
      setSettings(response.data)
      reset(response.data)
    } catch (error) {
      toast.error('Failed to fetch settings')
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      await api.put('/admin/settings', data)
      toast.success('Settings updated successfully')
      fetchSettings()
    } catch (error) {
      toast.error('Failed to update settings')
      console.error('Error updating settings:', error)
    }
  }

  const handleToggle = async (key) => {
    try {
      const newValue = !settings[key]
      await api.put('/admin/settings', { [key]: newValue })
      setSettings(prev => ({ ...prev, [key]: newValue }))
      toast.success('Setting updated successfully')
    } catch (error) {
      toast.error('Failed to update setting')
      console.error('Error updating setting:', error)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-500">
          You don't have permission to access this page.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage application settings and configurations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    {...register('siteName')}
                    placeholder="Enter site name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    placeholder="Enter contact email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Site Description</Label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="Enter site description"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable QR Code Scanning</Label>
                  <p className="text-sm text-gray-500">
                    Allow staff to scan QR codes for ticket verification
                  </p>
                </div>
                <Switch
                  checked={settings?.enableQRScanning}
                  onCheckedChange={() => handleToggle('enableQRScanning')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-gray-500">
                    Require users to verify their email before purchasing tickets
                  </p>
                </div>
                <Switch
                  checked={settings?.requireEmailVerification}
                  onCheckedChange={() => handleToggle('requireEmailVerification')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Ticket Transfers</Label>
                  <p className="text-sm text-gray-500">
                    Allow users to transfer their tickets to other users
                  </p>
                </div>
                <Switch
                  checked={settings?.allowTicketTransfers}
                  onCheckedChange={() => handleToggle('allowTicketTransfers')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Send email notifications for ticket purchases and updates
                  </p>
                </div>
                <Switch
                  checked={settings?.enableEmailNotifications}
                  onCheckedChange={() => handleToggle('enableEmailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Send SMS notifications for ticket purchases and updates
                  </p>
                </div>
                <Switch
                  checked={settings?.enableSMSNotifications}
                  onCheckedChange={() => handleToggle('enableSMSNotifications')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset(settings)}
          >
            Reset
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  )
} 