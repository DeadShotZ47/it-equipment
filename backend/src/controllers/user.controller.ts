import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

// GET /api/users
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, role, status, page = '1', limit = '50' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { employeeId: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (role && (role === 'ADMIN' || role === 'USER')) {
      where.role = role;
    }

    if (status !== undefined && status !== '') {
      if (status === 'active') where.isActive = true;
      else if (status === 'inactive') where.isActive = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          employeeId: true,
          email: true,
          fullName: true,
          department: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { requests: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      items: users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/:id
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        email: true,
        fullName: true,
        department: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { requests: true }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งาน' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/users
export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, email, password, fullName, department, role, isActive } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ message: 'กรุณากรอกชื่อ-นามสกุล, อีเมล และรหัสผ่าน' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      return;
    }

    const finalEmpId = employeeId?.trim() || `EMP-${Date.now().toString().slice(-6)}`;
    const finalEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: finalEmail },
          { employeeId: finalEmpId }
        ]
      }
    });

    if (existing) {
      res.status(409).json({ message: 'อีเมลหรือรหัสพนักงานนี้มีอยู่ในระบบแล้ว' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        employeeId: finalEmpId,
        email: finalEmail,
        passwordHash,
        fullName: fullName.trim(),
        department: department?.trim() || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        isActive: isActive !== false
      },
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

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { employeeId, email, password, fullName, department, role, isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
      return;
    }

    // Check conflict if employeeId or email changed
    if (email || employeeId) {
      const conflict = await prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            email ? { email: email.trim().toLowerCase() } : {},
            employeeId ? { employeeId: employeeId.trim() } : {}
          ]
        }
      });

      if (conflict) {
        res.status(409).json({ message: 'อีเมลหรือรหัสพนักงานซ้ำกับผู้ใช้อื่นในระบบ' });
        return;
      }
    }

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (department !== undefined) updateData.department = department ? department.trim() : null;
    if (role && (role === 'ADMIN' || role === 'USER')) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = !!isActive;
    if (employeeId) updateData.employeeId = employeeId.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    if (password && password.trim()) {
      if (password.length < 6) {
        res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
        return;
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        employeeId: true,
        email: true,
        fullName: true,
        department: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      res.status(400).json({ message: 'ไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่ได้' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { requests: true } }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
      return;
    }

    // If user has requests history, deactivate instead of hard delete to preserve history
    if (user._count.requests > 0) {
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });
      res.json({
        message: 'ระงับการใช้งานบัญชีนี้เรียบร้อยแล้ว (ไม่สามารถลบถาวรได้เนื่องจากมีประวัติการทำรายการเบิกอุปกรณ์)',
        deactivated: true
      });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'ลบผู้ใช้งานสำเร็จ', deleted: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
