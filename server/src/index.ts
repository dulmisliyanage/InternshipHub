import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import prisma from './prisma';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import companyRoutes from './routes/company.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Authentication routes
app.use('/api/auth', authRoutes);

// Role-protected routes (RBAC)
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);

// Step 5: Basic API health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'InternshipHub API is running'
  });
});

// Step 6: PostgreSQL + Prisma connectivity check
app.get('/api/db-health', async (req: Request, res: Response) => {
  try {
    // Quick test query to verify database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      message: 'PostgreSQL connected successfully via Prisma'
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Database connection failed. Ensure PostgreSQL is running and DATABASE_URL in server/.env is valid.',
      details: error.message
    });
  }
});

// Full end-to-end status endpoint
app.get('/api/status', async (req: Request, res: Response) => {
  let dbStatus = { status: 'checking', message: '' };
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = {
      status: 'connected',
      message: 'PostgreSQL is online and responsive via Prisma'
    };
  } catch (error: any) {
    dbStatus = {
      status: 'disconnected',
      message: 'PostgreSQL is offline or connection failed. Check server/.env DATABASE_URL.'
    };
  }

  res.status(200).json({
    timestamp: new Date().toISOString(),
    api: {
      status: 'ok',
      message: 'InternshipHub Express API is running'
    },
    database: dbStatus
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
