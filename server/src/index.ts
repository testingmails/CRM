import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import userRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import { authenticateSocket } from './middleware/auth';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.IO for real-time updates
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  socket.join('leads-room');

  socket.on('lead-updated', (leadData) => {
    socket.to('leads-room').emit('lead-updated', leadData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io, prisma };