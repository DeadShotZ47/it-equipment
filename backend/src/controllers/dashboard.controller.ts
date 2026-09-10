import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // High-performance PostgreSQL SQL Aggregation directly on database
    const equipmentStats: any[] = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS total_equipment,
        COUNT(*) FILTER (WHERE NOT is_consumable)::int AS total_fixed_assets,
        COUNT(*) FILTER (WHERE is_consumable)::int AS total_consumables,
        COUNT(*) FILTER (WHERE status = 'CHECKED_OUT')::int AS checked_out_count,
        COUNT(*) FILTER (WHERE status = 'AVAILABLE')::int AS available_count,
        COUNT(*) FILTER (WHERE status = 'MAINTENANCE')::int AS maintenance_count,
        COUNT(*) FILTER (WHERE is_consumable AND quantity <= 5)::int AS low_stock_count
      FROM equipment;
    `;

    const requestStats: any[] = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS total_requests,
        COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending_requests,
        COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS approved_requests,
        COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected_requests,
        COUNT(*) FILTER (WHERE status = 'RETURNED')::int AS returned_requests
      FROM requests;
    `;

    const stats = {
      totalEquipment: equipmentStats[0]?.total_equipment || 0,
      totalFixedAssets: equipmentStats[0]?.total_fixed_assets || 0,
      totalConsumables: equipmentStats[0]?.total_consumables || 0,
      checkedOut: equipmentStats[0]?.checked_out_count || 0,
      available: equipmentStats[0]?.available_count || 0,
      maintenance: equipmentStats[0]?.maintenance_count || 0,
      lowStock: equipmentStats[0]?.low_stock_count || 0,
      pendingRequests: requestStats[0]?.pending_requests || 0,
      approvedRequests: requestStats[0]?.approved_requests || 0,
      rejectedRequests: requestStats[0]?.rejected_requests || 0,
      returnedRequests: requestStats[0]?.returned_requests || 0
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const mode = (req.query.mode as string) || 'year';
    const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    // 1. SPECIFIC MONTH MODE (Day by day in that month)
    if (mode === 'month') {
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
      const month = parseInt(req.query.month as string, 10) || (new Date().getMonth() + 1);
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthLabel = thaiMonthsShort[month - 1] || '';

      const trends: any[] = await prisma.$queryRaw`
        SELECT
          EXTRACT(DAY FROM created_at)::int AS day_num,
          COUNT(*)::int AS total_requests,
          COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS approved,
          COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected,
          COUNT(*) FILTER (WHERE status = 'RETURNED')::int AS returned
        FROM requests
        WHERE EXTRACT(YEAR FROM created_at) = ${year}
          AND EXTRACT(MONTH FROM created_at) = ${month}
        GROUP BY day_num
        ORDER BY day_num ASC;
      `;

      const formatted = Array.from({ length: daysInMonth }, (_, idx) => {
        const dayNum = idx + 1;
        const found = trends.find((t) => t.day_num === dayNum);
        return {
          label: `${dayNum} ${monthLabel}`,
          day: dayNum,
          month: monthLabel,
          total: found ? found.total_requests : 0,
          approved: found ? found.approved : 0,
          rejected: found ? found.rejected : 0,
          returned: found ? found.returned : 0
        };
      });

      res.json(formatted);
      return;
    }

    // 2. DATE RANGE MODE (Day by day between startDate and endDate)
    if (mode === 'range') {
      const startStr = (req.query.startDate as string) || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const endStr = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);

      const start = new Date(`${startStr}T00:00:00.000Z`);
      const end = new Date(`${endStr}T23:59:59.999Z`);

      const trends: any[] = await prisma.$queryRaw`
        SELECT
          TO_CHAR(created_at, 'YYYY-MM-DD') AS date_str,
          COUNT(*)::int AS total_requests,
          COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS approved,
          COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected,
          COUNT(*) FILTER (WHERE status = 'RETURNED')::int AS returned
        FROM requests
        WHERE created_at >= ${start} AND created_at <= ${end}
        GROUP BY date_str
        ORDER BY date_str ASC;
      `;

      const formatted = [];
      const curr = new Date(start);
      // Safety cap to prevent infinite loop (max 180 days)
      let safetyCount = 0;
      while (curr <= end && safetyCount < 180) {
        safetyCount++;
        const dateIso = curr.toISOString().slice(0, 10);
        const dayNum = curr.getUTCDate();
        const mIdx = curr.getUTCMonth();
        const found = trends.find((t) => t.date_str === dateIso);
        formatted.push({
          label: `${dayNum} ${thaiMonthsShort[mIdx]}`,
          date: dateIso,
          month: thaiMonthsShort[mIdx],
          total: found ? found.total_requests : 0,
          approved: found ? found.approved : 0,
          rejected: found ? found.rejected : 0,
          returned: found ? found.returned : 0
        });
        curr.setUTCDate(curr.getUTCDate() + 1);
      }

      res.json(formatted);
      return;
    }

    // 3. FULL YEAR MODE (Month by month in that year) - DEFAULT
    const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

    const trends: any[] = await prisma.$queryRaw`
      SELECT
        TO_CHAR(created_at, 'Mon') AS month_name,
        EXTRACT(MONTH FROM created_at)::int AS month_num,
        COUNT(*)::int AS total_requests,
        COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected,
        COUNT(*) FILTER (WHERE status = 'RETURNED')::int AS returned
      FROM requests
      WHERE EXTRACT(YEAR FROM created_at) = ${year}
      GROUP BY month_num, month_name
      ORDER BY month_num ASC;
    `;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = months.map((m, idx) => {
      const found = trends.find((t) => t.month_num === idx + 1);
      return {
        label: thaiMonthsShort[idx],
        month: m,
        total: found ? found.total_requests : 0,
        approved: found ? found.approved : 0,
        rejected: found ? found.rejected : 0,
        returned: found ? found.returned : 0
      };
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEquipmentByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // PostgreSQL aggregation joined with categories
    const categoryStats: any[] = await prisma.$queryRaw`
      SELECT
        c.name AS category_name,
        COUNT(e.id)::int AS count
      FROM categories c
      LEFT JOIN equipment e ON e.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC;
    `;

    res.json(categoryStats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
