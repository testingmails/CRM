'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LeadsPage } from '@/components/leads/leads-page';

export default function Leads() {
  return (
    <DashboardLayout>
      <LeadsPage />
    </DashboardLayout>
  );
}