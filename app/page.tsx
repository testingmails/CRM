'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { LoginForm } from '@/components/auth/login-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4682B4]"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}