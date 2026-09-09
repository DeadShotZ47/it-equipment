import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const getHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      status,
      type,
      startDate,
      endDate,
      page = '1',
      limit = '100'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Regular users can only see their own history
    if (req.user?.role !== 'ADMIN') {
      where.requesterId = req.user?.userId;
    }

    if (status) {
      where.status = status as any;
    }

    if (type) {
      where.type = type as any;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(new Date(endDate as string).setHours(23, 59, 59, 999));
      }
    }

    if (search) {
      where.OR = [
        { requestNumber: { contains: search as string, mode: 'insensitive' } },
        { reason: { contains: search as string, mode: 'insensitive' } },
        { requester: { fullName: { contains: search as string, mode: 'insensitive' } } },
        { items: { some: { equipment: { name: { contains: search as string, mode: 'insensitive' } } } } }
      ];
    }

    const [total, requests] = await Promise.all([
      prisma.request.count({ where }),
      prisma.request.findMany({
        where,
        include: {
          requester: {
            select: { id: true, employeeId: true, fullName: true, email: true, department: true }
          },
          items: {
            include: {
              equipment: {
                include: { category: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      })
    ]);

    // Flatten for AG-Grid table
    const flattenedRows = requests.flatMap((req) => {
      return req.items.map((item) => ({
        id: item.id,
        requestId: req.id,
        requestNumber: req.requestNumber,
        requestType: req.type,
        status: req.status,
        createdAt: req.createdAt,
        approvedAt: req.approvedAt,
        rejectedAt: req.rejectedAt,
        returnedAt: item.returnedAt,
        checkedOutAt: item.checkedOutAt,
        requesterName: req.requester.fullName,
        requesterEmail: req.requester.email,
        department: req.requester.department,
        equipmentName: item.equipment.name,
        categoryName: item.equipment.category?.name,
        serialNumber: item.equipment.serialNumber || '-',
        isConsumable: item.equipment.isConsumable,
        quantity: item.quantity,
        adminNote: req.adminNote,
        reason: req.reason
      }));
    });

    res.json({
      items: flattenedRows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
