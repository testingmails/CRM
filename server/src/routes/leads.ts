import express from 'express';
import { z } from 'zod';
import { prisma, io } from '../index';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

const createLeadSchema = z.object({
  rfq: z.string().optional(),
  messageId: z.string(),
  threadId: z.string(),
  marketingUser: z.string(),
  email: z.string().email(),
  contactNo: z.string(),
  companyName: z.string(),
  body: z.string(),
  subject: z.string(),
  website: z.string().optional(),
  threadLinks: z.any().optional(),
  date: z.string().transform((str) => new Date(str)),
  country: z.string(),
  formSent: z.boolean().optional(),
  formFilled: z.boolean().optional(),
  responseSheet: z.string().optional(),
  followup: z.string().optional(),
  quotationStatus: z.enum(['PENDING', 'SENT', 'ACCEPTED', 'REJECTED']).optional(),
  remark: z.string().optional(),
  dealWon: z.boolean().optional(),
  probableCustomer: z.boolean().optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'CLOSED']).optional(),
  review: z.string().optional(),
  callFollowup: z.string().optional().transform((str) => str ? new Date(str) : undefined)
});

const updateLeadSchema = createLeadSchema.partial();

// Get all leads with filtering and pagination
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const status = req.query.status as string;
    const country = req.query.country as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (dateFrom && dateTo) {
      where.date = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          activityLogs: {
            take: 3,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { name: true } } }
          }
        }
      }),
      prisma.lead.count({ where })
    ]);

    res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        activityLogs: {
          orderBy: { timestamp: 'desc' },
          include: { user: { select: { name: true } } }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create lead
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const leadData = createLeadSchema.parse(req.body);

    const lead = await prisma.lead.create({
      data: leadData,
      include: {
        activityLogs: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        userId: req.userId!,
        action: 'CREATED',
        details: { message: 'Lead created' }
      }
    });

    // Emit real-time update
    io.to('leads-room').emit('lead-created', lead);

    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(400).json({ error: 'Invalid lead data' });
  }
});

// Update lead
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const leadData = updateLeadSchema.parse(req.body);

    const existingLead = await prisma.lead.findUnique({
      where: { id: req.params.id }
    });

    if (!existingLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: leadData,
      include: {
        activityLogs: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        userId: req.userId!,
        action: 'UPDATED',
        details: { changes: leadData }
      }
    });

    // Emit real-time update
    io.to('leads-room').emit('lead-updated', lead);

    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(400).json({ error: 'Invalid lead data' });
  }
});

// Delete lead
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await prisma.lead.delete({
      where: { id: req.params.id }
    });

    // Emit real-time update
    io.to('leads-room').emit('lead-deleted', { id: req.params.id });

    res.status(204).send();
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;