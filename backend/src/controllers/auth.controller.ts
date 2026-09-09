import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    });

    res.json({
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        fullName: user.fullName,
        department: user.department,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, email, password, fullName, department, role } = req.body;
    if (!employeeId || !email || !password || !fullName) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { employeeId }]
      }
    });

    if (existingUser) {
      res.status(409).json({ message: 'Email or Employee ID already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        employeeId,
        email,
        passwordHash,
        fullName,
        department,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER'
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        fullName: user.fullName,
        department: user.department,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        employeeId: true,
        email: true,
        fullName: true,
        department: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
