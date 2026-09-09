import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const getRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, type, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Regular users can only see their own requests
    if (req.user?.role !== 'ADMIN') {
      where.requesterId = req.user?.userId;
    }

    if (status) {
      where.status = status as any;
    }

    if (type) {
      where.type = type as any;
    }

    const [total, items] = await Promise.all([
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

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRequestById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findUnique({
      where: { id },
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
      }
    });

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    // Regular user cannot view another user's request
    if (req.user?.role !== 'ADMIN' && request.requesterId !== req.user?.userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { equipmentId, quantity = 1, reason } = req.body;
    if (!equipmentId) {
      res.status(400).json({ message: 'Equipment ID is required' });
      return;
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      res.status(404).json({ message: 'Equipment not found' });
      return;
    }

    // Validation
    if (equipment.isConsumable) {
      if (equipment.quantity < quantity) {
        res.status(400).json({
          message: `Insufficient stock. Available: ${equipment.quantity}, Requested: ${quantity}`
        });
        return;
      }
    } else {
      if (equipment.status !== 'AVAILABLE') {
        res.status(400).json({
          message: `Equipment is currently ${equipment.status.toLowerCase().replace('_', ' ')}`
        });
        return;
      }
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await prisma.request.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const requestNumber = `REQ-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;
    const requestType = equipment.isConsumable ? 'CONSUME' : 'CHECKOUT';

    const newRequest = await prisma.request.create({
      data: {
        requestNumber,
        requesterId: userId,
        type: requestType,
        status: 'PENDING',
        reason,
        items: {
          create: [
            {
              equipmentId,
              quantity: equipment.isConsumable ? Number(quantity) : 1
            }
          ]
        }
      },
      include: {
        requester: {
          select: { id: true, employeeId: true, fullName: true, email: true, department: true }
        },
        items: {
          include: {
            equipment: { include: { category: true } }
          }
        }
      }
    });

    res.status(201).json(newRequest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const request = await prisma.request.findUnique({
      where: { id },
      include: { items: { include: { equipment: true } } }
    });

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (request.status !== 'PENDING') {
      res.status(400).json({ message: `Cannot approve request in ${request.status} status` });
      return;
    }

    // Execute in transaction
    const updated = await prisma.$transaction(async (tx) => {
      for (const item of request.items) {
        if (item.equipment.isConsumable) {
          if (item.equipment.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${item.equipment.name}`);
          }
          // Deduct stock immediately
          await tx.equipment.update({
            where: { id: item.equipmentId },
            data: {
              quantity: { decrement: item.quantity }
            }
          });
        } else {
          if (item.equipment.status !== 'AVAILABLE') {
            throw new Error(`Equipment ${item.equipment.name} is no longer available`);
          }
          // Mark checked out
          await tx.equipment.update({
            where: { id: item.equipmentId },
            data: { status: 'CHECKED_OUT' }
          });
        }

        // Set checkedOutAt timestamp
        await tx.requestItem.update({
          where: { id: item.id },
          data: { checkedOutAt: new Date() }
        });
      }

      return tx.request.update({
        where: { id },
        data: {
          status: 'APPROVED',
          adminNote,
          approvedAt: new Date()
        },
        include: {
          requester: { select: { fullName: true, email: true } },
          items: { include: { equipment: true } }
        }
      });
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (request.status !== 'PENDING') {
      res.status(400).json({ message: `Cannot reject request in ${request.status} status` });
      return;
    }

    const updated = await prisma.request.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote,
        rejectedAt: new Date()
      },
      include: {
        requester: { select: { fullName: true, email: true } },
        items: { include: { equipment: true } }
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const returnRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: { items: { include: { equipment: true } } }
    });

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (request.status !== 'APPROVED') {
      res.status(400).json({ message: 'Only approved requests can be returned' });
      return;
    }

    if (request.type !== 'CHECKOUT') {
      res.status(400).json({ message: 'Consumable items cannot be returned' });
      return;
    }

    // Transaction to update equipment status back to AVAILABLE
    const updated = await prisma.$transaction(async (tx) => {
      for (const item of request.items) {
        await tx.equipment.update({
          where: { id: item.equipmentId },
          data: { status: 'AVAILABLE' }
        });

        await tx.requestItem.update({
          where: { id: item.id },
          data: { returnedAt: new Date() }
        });
      }

      return tx.request.update({
        where: { id },
        data: { status: 'RETURNED' },
        include: {
          requester: { select: { fullName: true, email: true } },
          items: { include: { equipment: true } }
        }
      });
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmQrScan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { qrCode, requestId } = req.body;
    if (!qrCode) {
      res.status(400).json({ message: 'QR Code is required' });
      return;
    }

    // Find equipment matching qrCode
    const equipment = await prisma.equipment.findFirst({
      where: {
        OR: [{ qrCode }, { serialNumber: qrCode }, { id: qrCode }]
      },
      include: { category: true }
    });

    if (!equipment) {
      res.status(404).json({ message: 'No equipment matches the scanned QR code' });
      return;
    }

    // If specific requestId provided
    let targetRequest;
    if (requestId) {
      targetRequest = await prisma.request.findUnique({
        where: { id: requestId },
        include: { items: { include: { equipment: true } } }
      });
    } else {
      // Find latest approved request for this equipment for this user
      targetRequest = await prisma.request.findFirst({
        where: {
          status: 'APPROVED',
          requesterId: req.user?.userId,
          items: { some: { equipmentId: equipment.id } }
        },
        include: { items: { include: { equipment: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!targetRequest) {
      res.json({
        success: true,
        action: 'EQUIPMENT_INFO',
        equipment,
        message: 'Equipment scanned successfully'
      });
      return;
    }

    // Check if return or initial checkout confirmation
    const item = targetRequest.items.find(i => i.equipmentId === equipment.id);
    if (!item) {
      res.status(400).json({ message: 'Equipment is not part of this request' });
      return;
    }

    if (!item.qrScannedAt) {
      // First scan: confirm receipt
      await prisma.requestItem.update({
        where: { id: item.id },
        data: { qrScannedAt: new Date() }
      });

      res.json({
        success: true,
        action: 'CONFIRM_RECEIVE',
        equipment,
        request: targetRequest,
        message: `Successfully confirmed pickup for ${equipment.name}`
      });
      return;
    }

    // Second scan for checkout item: return
    if (targetRequest.type === 'CHECKOUT' && targetRequest.status === 'APPROVED') {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.equipment.update({
          where: { id: equipment.id },
          data: { status: 'AVAILABLE' }
        });

        await tx.requestItem.update({
          where: { id: item.id },
          data: { returnedAt: new Date() }
        });

        return tx.request.update({
          where: { id: targetRequest.id },
          data: { status: 'RETURNED' }
        });
      });

      res.json({
        success: true,
        action: 'CONFIRM_RETURN',
        equipment,
        request: updated,
        message: `Successfully confirmed return for ${equipment.name}`
      });
      return;
    }

    res.json({
      success: true,
      action: 'ALREADY_PROCESSED',
      equipment,
      message: 'Request already completed'
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
