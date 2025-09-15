'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface LeadDetailProps {
  leadId: string;
}

interface Lead {
  id: string;
  rfq?: string;
  messageId: string;
  threadId: string;
  marketingUser: string;
  email: string;
  contactNo: string;
  companyName: string;
  body: string;
  subject: string;
  website?: string;
  threadLinks?: any;
  date: string;
  country: string;
  formSent: boolean;
  formFilled: boolean;
  responseSheet?: string;
  followup?: string;
  quotationStatus: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  remark?: string;
  dealWon: boolean;
  probableCustomer: boolean;
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED';
  review?: string;
  callFollowup?: string;
  createdAt: string;
  updatedAt: string;
  activityLogs: Array<{
    id: string;
    action: string;
    details?: any;
    timestamp: string;
    user: { name: string };
  }>;
}

export function LeadDetail({ leadId }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const { token } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchLead();
  }, [leadId, token]);

  useEffect(() => {
    const handleLeadUpdate = (event: CustomEvent) => {
      if (event.detail.id === leadId) {
        setLead(event.detail);
        setFormData(event.detail);
        toast.info('Lead updated by another user');
      }
    };

    window.addEventListener('lead-updated', handleLeadUpdate as EventListener);
    return () => {
      window.removeEventListener('lead-updated', handleLeadUpdate as EventListener);
    };
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads/${leadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch lead');

      const data = await response.json();
      setLead(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update lead');

      const updatedLead = await response.json();
      setLead(updatedLead);
      setFormData(updatedLead);
      setHasChanges(false);
      
      // Emit socket update
      socket?.emit('lead-updated', updatedLead);
      
      toast.success('Lead updated successfully');
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast.error('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return <div>Lead not found</div>;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/leads">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-[#333333]">{lead.companyName}</h2>
            <p className="text-gray-600">{lead.email}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="bg-[#4682B4] hover:bg-[#4682B4]/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
              <CardDescription>Basic lead details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ''}
                    onChange={(e) => updateField('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNo">Contact Number</Label>
                  <Input
                    id="contactNo"
                    value={formData.contactNo || ''}
                    onChange={(e) => updateField('contactNo', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketingUser">Marketing User</Label>
                  <Input
                    id="marketingUser"
                    value={formData.marketingUser || ''}
                    onChange={(e) => updateField('marketingUser', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject || ''}
                  onChange={(e) => updateField('subject', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message Body</Label>
                <Textarea
                  id="body"
                  value={formData.body || ''}
                  onChange={(e) => updateField('body', e.target.value)}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Follow-up & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Follow-up & Status</CardTitle>
              <CardDescription>Track progress and manage follow-up activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateField('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quotationStatus">Quotation Status</Label>
                  <Select
                    value={formData.quotationStatus}
                    onValueChange={(value) => updateField('quotationStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callFollowup">Call Follow-up Date</Label>
                  <Input
                    id="callFollowup"
                    type="datetime-local"
                    value={formData.callFollowup ? new Date(formData.callFollowup).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateField('callFollowup', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followup">Follow-up Notes</Label>
                  <Input
                    id="followup"
                    value={formData.followup || ''}
                    onChange={(e) => updateField('followup', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dealWon"
                    checked={formData.dealWon || false}
                    onChange={(e) => updateField('dealWon', e.target.checked)}
                    className="w-4 h-4 text-[#4682B4] border-gray-300 rounded focus:ring-[#4682B4]"
                  />
                  <Label htmlFor="dealWon">Deal Won</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="probableCustomer"
                    checked={formData.probableCustomer || false}
                    onChange={(e) => updateField('probableCustomer', e.target.checked)}
                    className="w-4 h-4 text-[#4682B4] border-gray-300 rounded focus:ring-[#4682B4]"
                  />
                  <Label htmlFor="probableCustomer">Probable Customer</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="formFilled"
                    checked={formData.formFilled || false}
                    onChange={(e) => updateField('formFilled', e.target.checked)}
                    className="w-4 h-4 text-[#4682B4] border-gray-300 rounded focus:ring-[#4682B4]"
                  />
                  <Label htmlFor="formFilled">Form Filled</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remark">Remarks</Label>
                <Textarea
                  id="remark"
                  value={formData.remark || ''}
                  onChange={(e) => updateField('remark', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review">Review</Label>
                <Textarea
                  id="review"
                  value={formData.review || ''}
                  onChange={(e) => updateField('review', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="secondary" className={statusColors[lead.status]}>
                  {lead.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Quotation:</span>
                <Badge variant="secondary" className={quotationColors[lead.quotationStatus]}>
                  {lead.quotationStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Deal Won:</span>
                <Badge variant={lead.dealWon ? 'default' : 'secondary'}>
                  {lead.dealWon ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm text-gray-600">
                  {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Updated:</span>
                <span className="text-sm text-gray-600">
                  {format(new Date(lead.updatedAt), 'MMM d, yyyy')}
                </span>
              </div>
              {lead.callFollowup && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Next Follow-up</div>
                    <div className="text-xs text-yellow-600">
                      {format(new Date(lead.callFollowup), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent activities on this lead</CardDescription>
            </CardHeader>
            <CardContent>
              {lead.activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {lead.activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[#4682B4] rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {log.action.replace('_', ' ').toLowerCase()}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {log.user.name} • {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No activity logs yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}