import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'SALES', 'MARKETING'])
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'SALES', 'MARKETING']).optional(),
  password: z.string().min(6).optional()
});

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, email, password, role } = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({ error: 'Invalid user data' });
  }
});

// Update user (Admin only)
router.patch('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const userData = updateUserSchema.parse(req.body);

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: userData.password 
        ? { ...userData, passwordHash: userData.password, password: undefined }
        : userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ error: 'Invalid user data' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;