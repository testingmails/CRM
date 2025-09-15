'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Lead {
  id: string;
  companyName: string;
  email: string;
  country: string;
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED';
  quotationStatus: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

interface RecentLeadsTableProps {
  leads: Lead[];
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-green-100 text-green-800'
};

const quotationColors = {
  PENDING: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800'
};

export function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
  if (!leads.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No leads found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Quotation</TableHead>
            <TableHead>Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{lead.companyName}</div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </div>
              </TableCell>
              <TableCell>{lead.country}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusColors[lead.status]}>
                  {lead.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={quotationColors[lead.quotationStatus]}>
                  {lead.quotationStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {format(new Date(lead.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Link href={`/leads/${lead.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}