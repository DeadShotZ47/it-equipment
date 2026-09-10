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

    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      console.warn(`[Auth] ❌ เข้าสู่ระบบไม่สำเร็จ: ไม่พบอีเมล ${cleanEmail}`);
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    if (!user.isActive) {
      console.warn(`[Auth] ❌ เข้าสู่ระบบไม่สำเร็จ: บัญชี ${cleanEmail} ถูกระงับ`);
      res.status(403).json({ message: 'บัญชีผู้ใช้นี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.warn(`[Auth] ❌ เข้าสู่ระบบไม่สำเร็จ: รหัสผ่านไม่ถูกต้องสำหรับ ${cleanEmail}`);
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    console.log(`[Auth] ✅ เข้าสู่ระบบสำเร็จ: ${user.fullName} (${user.email}) - Role: ${user.role}`);

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
    const { employeeId, email, password, fullName, department } = req.body;
    if (!email || !password || !fullName) {
      res.status(400).json({ message: 'กรุณากรอกชื่อ-นามสกุล, อีเมล และรหัสผ่าน' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      return;
    }

    // Auto-generate employeeId if not provided
    const finalEmpId = employeeId?.trim() || `EMP-${Date.now().toString().slice(-6)}`;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { employeeId: finalEmpId }
        ]
      }
    });

    if (existingUser) {
      res.status(409).json({ message: 'อีเมลหรือรหัสพนักงานนี้มีอยู่ในระบบแล้ว' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        employeeId: finalEmpId,
        email: email.trim().toLowerCase(),
        passwordHash,
        fullName: fullName.trim(),
        department: department?.trim() || null,
        role: 'USER'
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
