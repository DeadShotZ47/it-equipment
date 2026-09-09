import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../utils/prisma.js';

export const getEquipmentList = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      categoryId,
      status,
      isConsumable,
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { serialNumber: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (status) {
      where.status = status as any;
    }

    if (isConsumable !== undefined) {
      where.isConsumable = isConsumable === 'true';
    }

    const [total, items] = await Promise.all([
      prisma.equipment.count({ where }),
      prisma.equipment.findMany({
        where,
        include: { category: true },
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

export const getEquipmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.equipment.findFirst({
      where: {
        OR: [{ id }, { qrCode: id }, { serialNumber: id }]
      },
      include: {
        category: true,
        requestItems: {
          include: {
            request: {
              include: { requester: { select: { fullName: true, email: true, department: true } } }
            }
          },
          orderBy: { request: { createdAt: 'desc' } },
          take: 10
        }
      }
    });

    if (!item) {
      res.status(404).json({ message: 'Equipment not found' });
      return;
    }

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      categoryId,
      serialNumber,
      isConsumable,
      quantity,
      location,
      imageUrl
    } = req.body;

    if (!name || !categoryId) {
      res.status(400).json({ message: 'Name and Category are required' });
      return;
    }

    const isCons = Boolean(isConsumable);

    // Fixed asset requires serialNumber
    if (!isCons && !serialNumber) {
      res.status(400).json({ message: 'Serial Number is required for fixed assets' });
      return;
    }

    // Check unique serialNumber if provided
    if (serialNumber) {
      const existing = await prisma.equipment.findUnique({ where: { serialNumber } });
      if (existing) {
        res.status(409).json({ message: 'Serial Number already exists' });
        return;
      }
    }

    const qrCodeVal = `EQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        description,
        categoryId,
        serialNumber: isCons ? (serialNumber || null) : serialNumber,
        isConsumable: isCons,
        quantity: isCons ? (Number(quantity) || 1) : 1,
        location,
        imageUrl,
        qrCode: qrCodeVal,
        status: 'AVAILABLE'
      },
      include: { category: true }
    });

    res.status(201).json(equipment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      categoryId,
      serialNumber,
      isConsumable,
      quantity,
      status,
      location,
      imageUrl
    } = req.body;

    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Equipment not found' });
      return;
    }

    if (serialNumber && serialNumber !== existing.serialNumber) {
      const duplicate = await prisma.equipment.findUnique({ where: { serialNumber } });
      if (duplicate) {
        res.status(409).json({ message: 'Serial Number already exists' });
        return;
      }
    }

    const isCons = isConsumable !== undefined ? Boolean(isConsumable) : existing.isConsumable;

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        serialNumber: isCons ? (serialNumber || null) : (serialNumber || existing.serialNumber),
        isConsumable: isCons,
        quantity: isCons ? (Number(quantity) ?? existing.quantity) : 1,
        status,
        location,
        imageUrl
      },
      include: { category: true }
    });

    res.json(equipment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const activeItem = await prisma.requestItem.findFirst({
      where: {
        equipmentId: id,
        request: { status: { in: ['PENDING', 'APPROVED'] } }
      }
    });

    if (activeItem) {
      res.status(400).json({ message: 'Cannot delete equipment with active requests' });
      return;
    }

    await prisma.equipment.delete({ where: { id } });
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEquipmentQr = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!equipment) {
      res.status(404).json({ message: 'Equipment not found' });
      return;
    }

    const qrData = JSON.stringify({
      id: equipment.id,
      code: equipment.qrCode,
      name: equipment.name,
      serialNumber: equipment.serialNumber,
      isConsumable: equipment.isConsumable
    });

    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2
    });

    res.json({
      qrCode: equipment.qrCode,
      qrDataUrl,
      equipment
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
