import { prisma } from '../src/utils/prisma.js';

async function main() {
  const items = await prisma.equipment.findMany({
    include: { category: true }
  });

  console.log(`Found ${items.length} items in DB:`);
  for (const item of items) {
    let imageUrl = item.imageUrl;

    const lower = item.name.toLowerCase();
    const cat = item.category.name.toLowerCase();

    if (lower.includes('macbook') || lower.includes('apple')) {
      imageUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('thinkpad') || lower.includes('laptop')) {
      imageUrl = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('ultrasharp') || lower.includes('dell')) {
      imageUrl = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('ultrawide') || lower.includes('lg') || lower.includes('monitor')) {
      imageUrl = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('mouse') || lower.includes('logitech') || lower.includes('mx master')) {
      imageUrl = 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('keychron') || lower.includes('keyboard')) {
      imageUrl = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('switch') || lower.includes('cisco')) {
      imageUrl = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('access point') || lower.includes('unifi') || lower.includes('wifi') || lower.includes('router')) {
      imageUrl = 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('cable') || lower.includes('cat6') || lower.includes('lan') || lower.includes('สาย')) {
      imageUrl = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('adapter') || lower.includes('hdmi') || lower.includes('usb')) {
      imageUrl = 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80';
    } else if (lower.includes('batter') || lower.includes('ถ่าน') || lower.includes('energizer')) {
      imageUrl = 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80';
    } else if (cat.includes('laptop')) {
      imageUrl = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80';
    } else if (cat.includes('monitor')) {
      imageUrl = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80';
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80';
    }

    await prisma.equipment.update({
      where: { id: item.id },
      data: { imageUrl }
    });
    console.log(` -> Updated: ${item.name} (${item.category.name})`);
  }
  console.log('✅ All items updated successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
