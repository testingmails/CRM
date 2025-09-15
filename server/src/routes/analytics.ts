import express from 'express';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Dashboard stats
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalLeads,
      quotationsSent,
      dealsWon,
      pendingFollowups,
      leadsByStatus,
      leadsByCountry,
      monthlyTrends
    ] = await Promise.all([
      // Total leads
      prisma.lead.count(),
      
      // Quotations sent
      prisma.lead.count({
        where: { quotationStatus: { not: 'PENDING' } }
      }),
      
      // Deals won
      prisma.lead.count({
        where: { dealWon: true }
      }),
      
      // Pending followups
      prisma.lead.count({
        where: { 
          callFollowup: { not: null },
          status: { not: 'CLOSED' }
        }
      }),
      
      // Leads by status
      prisma.lead.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Leads by country (top 10)
      prisma.lead.groupBy({
        by: ['country'],
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10
      }),
      
      // Monthly trends (last 12 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "leads"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `
    ]);

    res.json({
      stats: {
        totalLeads,
        quotationsSent,
        dealsWon,
        pendingFollowups
      },
      leadsByStatus: leadsByStatus.map(item => ({
        name: item.status,
        value: item._count.status
      })),
      leadsByCountry: leadsByCountry.map(item => ({
        name: item.country,
        value: item._count.country
      })),
      monthlyTrends
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Export leads data
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Convert to CSV format
    const headers = [
      'ID', 'Company Name', 'Email', 'Country', 'Status', 
      'Quotation Status', 'Deal Won', 'Created At'
    ];

    const csvData = [
      headers.join(','),
      ...leads.map(lead => [
        lead.id,
        `"${lead.companyName}"`,
        lead.email,
        lead.country,
        lead.status,
        lead.quotationStatus,
        lead.dealWon,
        lead.createdAt.toISOString()
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;