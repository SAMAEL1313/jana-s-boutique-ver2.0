import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default apiHandler({
  async GET(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const [items, orders] = await Promise.all([
      prisma.orderItem.aggregate({ _sum: { quantity: true } }),
      prisma.order.aggregate({ _count: { _all: true }, _sum: { totalAmount: true } }),
    ]);

    return res.status(200).json({
      success: true,
      totalProducts: items._sum.quantity ?? 0,
      totalOrders: orders._count._all,
      totalEarnings: Number(orders._sum.totalAmount ?? 0),
    });
  },
});
