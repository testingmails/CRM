'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LeadDetail } from '@/components/leads/lead-detail';

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <LeadDetail leadId={params.id} />
    </DashboardLayout>
  );
}