'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from './user-management';
import { CompanySettings } from './company-settings';
import { useAuth } from '@/components/providers/auth-provider';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#333333]">Settings</h2>
        <p className="text-gray-600">Manage your CRM system configuration</p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          {user?.role === 'ADMIN' && (
            <TabsTrigger value="users">Users</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <CompanySettings />
        </TabsContent>

        {user?.role === 'ADMIN' && (
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}