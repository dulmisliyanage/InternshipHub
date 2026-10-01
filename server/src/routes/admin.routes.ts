import { Router, Response } from 'express';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../prisma';

const router = Router();

// Apply authenticate and requireRole('ADMIN') to all /api/admin routes
router.use(authenticate, requireRole('ADMIN'));

/**
 * GET /api/admin/users
 * Returns list of all platform users. Strictly restricted to ADMIN role.
 */
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        provider: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      count: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve users',
    });
  }
});

router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Admin Control Center',
    admin: {
      id: req.user?.id,
      name: req.user?.name,
      role: req.user?.role,
    },
  });
});

export default router;
