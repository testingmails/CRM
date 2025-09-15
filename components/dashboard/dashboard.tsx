'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { StatsCards } from './stats-cards';
import { RecentLeadsTable } from './recent-leads-table';
import { LeadStatusChart } from './lead-status-chart';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardData {
  stats: {
    totalLeads: number;
    quotationsSent: number;
    dealsWon: number;
    pendingFollowups: number;
  };
  leadsByStatus: Array<{ name: string; value: number }>;
  recentLeads: Array<any>;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, leadsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/dashboard-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const analyticsData = await analyticsRes.json();
      const leadsData = await leadsRes.json();

      setData({
        stats: analyticsData.stats,
        leadsByStatus: analyticsData.leadsByStatus,
        recentLeads: leadsData.leads
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'leads-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#333333]">Dashboard</h2>
        <Button onClick={handleExport} className="bg-[#4682B4] hover:bg-[#4682B4]/90">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <StatsCards stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
            <CardDescription>Overview of leads by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadStatusChart data={data.leadsByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest leads added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentLeadsTable leads={data.recentLeads} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}