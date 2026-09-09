import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { equipment: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        equipment: true
      }
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      res.status(409).json({ message: 'Category with this name already exists' });
      return;
    }

    const category = await prisma.category.create({
      data: { name, description, icon }
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (name && name !== existing.name) {
      const duplicate = await prisma.category.findUnique({ where: { name } });
      if (duplicate) {
        res.status(409).json({ message: 'Category name already exists' });
        return;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, description, icon }
    });

    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const equipmentCount = await prisma.equipment.count({
      where: { categoryId: id }
    });

    if (equipmentCount > 0) {
      res.status(400).json({
        message: `Cannot delete category: ${equipmentCount} equipment item(s) are associated with it`
      });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
