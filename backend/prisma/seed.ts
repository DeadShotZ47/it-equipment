import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in reverse order
  await prisma.requestItem.deleteMany();
  await prisma.request.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      employeeId: 'EMP-001',
      email: 'admin@company.com',
      passwordHash,
      fullName: 'IT Administrator',
      department: 'IT Infrastructure',
      role: 'ADMIN'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      employeeId: 'EMP-102',
      email: 'somchai@company.com',
      passwordHash,
      fullName: 'Somchai Prasert',
      department: 'Software Engineering',
      role: 'USER'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      employeeId: 'EMP-103',
      email: 'kanokwan@company.com',
      passwordHash,
      fullName: 'Kanokwan Srisuk',
      department: 'Marketing & Design',
      role: 'USER'
    }
  });

  console.log('✅ Created users: admin@company.com, somchai@company.com, kanokwan@company.com');

  // 3. Create Categories (Admin managed)
  const catLaptop = await prisma.category.create({
    data: { name: 'Laptops', description: 'Notebook computers and workstations', icon: 'laptop' }
  });
  const catMonitor = await prisma.category.create({
    data: { name: 'Monitors', description: 'Desktop display screens', icon: 'monitor' }
  });
  const catPeripherals = await prisma.category.create({
    data: { name: 'Peripherals', description: 'Keyboards, mice, webcams', icon: 'mouse' }
  });
  const catNetwork = await prisma.category.create({
    data: { name: 'Networking', description: 'Routers, switches, access points', icon: 'network' }
  });
  const catConsumables = await prisma.category.create({
    data: { name: 'Cables & Consumables', description: 'Cables, adapters, batteries', icon: 'zap' }
  });

  console.log('✅ Created categories');

  // 4. Create Hybrid Equipment
  // Fixed Assets (isConsumable = false)
  const mbp16 = await prisma.equipment.create({
    data: {
      name: 'MacBook Pro 16" (M3 Max, 36GB)',
      description: 'High-performance laptop for developers',
      categoryId: catLaptop.id,
      serialNumber: 'C02DF123GJK4',
      isConsumable: false,
      quantity: 1,
      status: 'AVAILABLE',
      location: 'IT Storage Cabinet A',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-MBP16-001'
    }
  });

  const thinkpad = await prisma.equipment.create({
    data: {
      name: 'ThinkPad X1 Carbon Gen 11',
      description: 'Lightweight business laptop',
      categoryId: catLaptop.id,
      serialNumber: 'PF-4X9902A',
      isConsumable: false,
      quantity: 1,
      status: 'CHECKED_OUT',
      location: 'Building 2, 4th Floor',
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-TPX1-002'
    }
  });

  const dellMonitor = await prisma.equipment.create({
    data: {
      name: 'Dell UltraSharp 27" 4K (U2723QE)',
      description: 'Color-accurate USB-C hub monitor',
      categoryId: catMonitor.id,
      serialNumber: 'CN-0123456789-A',
      isConsumable: false,
      quantity: 1,
      status: 'AVAILABLE',
      location: 'IT Storage Shelf B',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-DEL27-003'
    }
  });

  const lgMonitor = await prisma.equipment.create({
    data: {
      name: 'LG UltraWide 34" Curved',
      description: 'Ultrawide productivity monitor',
      categoryId: catMonitor.id,
      serialNumber: 'LG-34WN80C-B',
      isConsumable: false,
      quantity: 1,
      status: 'MAINTENANCE',
      location: 'IT Repair Center',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-LG34-004'
    }
  });

  const mxMaster = await prisma.equipment.create({
    data: {
      name: 'Logitech MX Master 3S',
      description: 'Ergonomic wireless mouse',
      categoryId: catPeripherals.id,
      serialNumber: '1940LZ12345',
      isConsumable: false,
      quantity: 1,
      status: 'AVAILABLE',
      location: 'IT Supply Drawer 1',
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-MXM3-005'
    }
  });

  const ciscoSwitch = await prisma.equipment.create({
    data: {
      name: 'Cisco Catalyst 24-Port Gigabit Switch',
      description: 'Rack-mount network switch',
      categoryId: catNetwork.id,
      serialNumber: 'FOC21345678',
      isConsumable: false,
      quantity: 1,
      status: 'AVAILABLE',
      location: 'Server Room Rack 2',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-CSCO-006'
    }
  });

  // Consumables (isConsumable = true)
  const hdmiCable = await prisma.equipment.create({
    data: {
      name: 'HDMI 2.1 Ultra High Speed Cable 2M',
      description: '4K/120Hz braided HDMI cable',
      categoryId: catConsumables.id,
      serialNumber: null,
      isConsumable: true,
      quantity: 35,
      status: 'AVAILABLE',
      location: 'IT Supply Drawer 2',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-HDMI-2M'
    }
  });

  const usbAdapter = await prisma.equipment.create({
    data: {
      name: 'USB-C to Multi-port Hub (HDMI/USB/LAN)',
      description: 'Compact 6-in-1 dongle',
      categoryId: catConsumables.id,
      serialNumber: null,
      isConsumable: true,
      quantity: 18,
      status: 'AVAILABLE',
      location: 'IT Supply Drawer 2',
      imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-USBC-HUB'
    }
  });

  const aaBatteries = await prisma.equipment.create({
    data: {
      name: 'Energizer AA Batteries (Pack of 4)',
      description: 'Alkaline batteries for wireless peripherals',
      categoryId: catConsumables.id,
      serialNumber: null,
      isConsumable: true,
      quantity: 4, // Low stock! (<= 5)
      status: 'AVAILABLE',
      location: 'IT Supply Drawer 3',
      imageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-BATT-AA'
    }
  });

  const cat6Cable = await prisma.equipment.create({
    data: {
      name: 'Cat6 Ethernet Patch Cable 3M (Blue)',
      description: 'Gigabit LAN cable',
      categoryId: catConsumables.id,
      serialNumber: null,
      isConsumable: true,
      quantity: 12,
      status: 'AVAILABLE',
      location: 'IT Supply Drawer 2',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      qrCode: 'EQ-CAT6-3M'
    }
  });

  console.log('✅ Created hybrid equipment items');

  // 5. Create Sample Requests
  // Approved and checked out
  const req1 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-20260901-0001',
      requesterId: user1.id,
      type: 'CHECKOUT',
      status: 'APPROVED',
      reason: 'Need laptop for client on-site deployment',
      approvedAt: new Date('2026-09-01T10:30:00Z'),
      items: {
        create: [
          {
            equipmentId: thinkpad.id,
            quantity: 1,
            checkedOutAt: new Date('2026-09-01T10:35:00Z'),
            qrScannedAt: new Date('2026-09-01T10:35:00Z')
          }
        ]
      }
    }
  });

  // Approved and returned
  const req2 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-20260815-0002',
      requesterId: user2.id,
      type: 'CHECKOUT',
      status: 'RETURNED',
      reason: 'Temporary presentation display setup',
      approvedAt: new Date('2026-08-15T09:00:00Z'),
      items: {
        create: [
          {
            equipmentId: dellMonitor.id,
            quantity: 1,
            checkedOutAt: new Date('2026-08-15T09:10:00Z'),
            returnedAt: new Date('2026-08-20T17:00:00Z'),
            qrScannedAt: new Date('2026-08-15T09:10:00Z')
          }
        ]
      }
    }
  });

  // Approved consumable request (stock deducted)
  const req3 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-20260905-0003',
      requesterId: user1.id,
      type: 'CONSUME',
      status: 'APPROVED',
      reason: 'Connecting secondary monitor for development workstation',
      approvedAt: new Date('2026-09-05T14:20:00Z'),
      items: {
        create: [
          {
            equipmentId: hdmiCable.id,
            quantity: 2,
            checkedOutAt: new Date('2026-09-05T14:25:00Z'),
            qrScannedAt: new Date('2026-09-05T14:25:00Z')
          }
        ]
      }
    }
  });

  // Pending requests awaiting Admin action
  const req4 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-20260907-0004',
      requesterId: user2.id,
      type: 'CHECKOUT',
      status: 'PENDING',
      reason: 'Design project requiring high-color accuracy Mac display',
      items: {
        create: [
          {
            equipmentId: mbp16.id,
            quantity: 1
          }
        ]
      }
    }
  });

  const req5 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-20260907-0005',
      requesterId: user1.id,
      type: 'CONSUME',
      status: 'PENDING',
      reason: 'Replacement batteries for team wireless mice in conference room B',
      items: {
        create: [
          {
            equipmentId: aaBatteries.id,
            quantity: 2
          }
        ]
      }
    }
  });

  console.log('✅ Created sample requests and history logs');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
