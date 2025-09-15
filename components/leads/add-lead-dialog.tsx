'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

interface AddLeadDialogProps {
  open: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}

export function AddLeadDialog({ open, onClose, onLeadAdded }: AddLeadDialogProps) {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    contactNo: '',
    country: '',
    subject: '',
    body: '',
    website: '',
    marketingUser: '',
    messageId: '',
    threadId: '',
    status: 'NEW' as const,
    quotationStatus: 'PENDING' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          date: new Date().toISOString(),
          messageId: formData.messageId || `msg_${Date.now()}`,
          threadId: formData.threadId || `thread_${Date.now()}`,
          marketingUser: formData.marketingUser || 'system'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create lead');
      }

      onLeadAdded();
      setFormData({
        companyName: '',
        email: '',
        contactNo: '',
        country: '',
        subject: '',
        body: '',
        website: '',
        marketingUser: '',
        messageId: '',
        threadId: '',
        status: 'NEW',
        quotationStatus: 'PENDING'
      });
    } catch (error) {
      console.error('Failed to create lead:', error);
      toast.error('Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Create a new lead entry in the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact Number *</Label>
              <Input
                id="contactNo"
                value={formData.contactNo}
                onChange={(e) => updateFormData('contactNo', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateFormData('country', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketingUser">Marketing User</Label>
              <Input
                id="marketingUser"
                value={formData.marketingUser}
                onChange={(e) => updateFormData('marketingUser', e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => updateFormData('subject', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message Body *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => updateFormData('body', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
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
              <Select value={formData.quotationStatus} onValueChange={(value) => updateFormData('quotationStatus', value)}>
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
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#4682B4] hover:bg-[#4682B4]/90">
              {loading ? 'Creating...' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}