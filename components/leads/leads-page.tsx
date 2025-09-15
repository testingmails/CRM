'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/components/providers/auth-provider';
import { AddLeadDialog } from './add-lead-dialog';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Lead {
  id: string;
  companyName: string;
  email: string;
  country: string;
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED';
  quotationStatus: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  dealWon: boolean;
  createdAt: string;
}

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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

export function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { token } = useAuth();

  useEffect(() => {
    fetchLeads();
  }, [token, currentPage, search, statusFilter, countryFilter]);

  // Listen for real-time updates
  useEffect(() => {
    const handleLeadUpdate = () => {
      fetchLeads();
    };

    window.addEventListener('lead-updated', handleLeadUpdate);
    window.addEventListener('lead-created', handleLeadUpdate);
    window.addEventListener('lead-deleted', handleLeadUpdate);

    return () => {
      window.removeEventListener('lead-updated', handleLeadUpdate);
      window.removeEventListener('lead-created', handleLeadUpdate);
      window.removeEventListener('lead-deleted', handleLeadUpdate);
    };
  }, []);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(countryFilter && { country: countryFilter })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch leads');

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadAdded = () => {
    setAddDialogOpen(false);
    fetchLeads();
    toast.success('Lead added successfully');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Leads</h2>
          <Button disabled className="bg-[#4682B4]">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#333333]">Leads</h2>
        <Button onClick={() => setAddDialogOpen(true)} className="bg-[#4682B4] hover:bg-[#4682B4]/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>Manage and track your customer leads</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by company name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>

          {/* Table */}
          {data?.leads.length ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quotation</TableHead>
                      <TableHead>Deal Won</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.leads.map((lead) => (
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
                        <TableCell>
                          <Badge variant={lead.dealWon ? 'default' : 'secondary'}>
                            {lead.dealWon ? 'Yes' : 'No'}
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

              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                    {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                    {data.pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(data.pagination.pages, p + 1))}
                      disabled={currentPage === data.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No leads found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      <AddLeadDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onLeadAdded={handleLeadAdded}
      />
    </div>
  );
}