'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/auth-provider';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyData {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  accentColor: string;
}

export function CompanySettings() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: 'Ananka Fasteners',
    primaryColor: '#4682B4',
    accentColor: '#FFD700'
  });

  useEffect(() => {
    // For demo purposes, we'll use default values
    // In a real app, you'd fetch this from an API
    setCompany({
      id: '1',
      name: 'Ananka Fasteners',
      primaryColor: '#4682B4',
      accentColor: '#FFD700'
    });
    setLoading(false);
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, you'd make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Company settings updated successfully');
      
      // Update CSS variables for theme colors
      document.documentElement.style.setProperty('--primary-color', formData.primaryColor);
      document.documentElement.style.setProperty('--accent-color', formData.accentColor);
      
    } catch (error) {
      console.error('Failed to save company settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
        <CardDescription>
          Configure your company branding and appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="primaryColor"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                placeholder="#4682B4"
              />
            </div>
            <p className="text-sm text-gray-500">
              Used for buttons, links, and primary UI elements
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="accentColor"
                type="color"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                placeholder="#FFD700"
              />
            </div>
            <p className="text-sm text-gray-500">
              Used for highlights, badges, and accent elements
            </p>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Color Preview</h4>
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-lg shadow-sm border"
              style={{ backgroundColor: formData.primaryColor }}
            ></div>
            <div 
              className="w-16 h-16 rounded-lg shadow-sm border"
              style={{ backgroundColor: formData.accentColor }}
            ></div>
            <Button
              style={{ 
                backgroundColor: formData.primaryColor,
                borderColor: formData.primaryColor
              }}
              className="text-white hover:opacity-90"
            >
              Primary Button
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#4682B4] hover:bg-[#4682B4]/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}