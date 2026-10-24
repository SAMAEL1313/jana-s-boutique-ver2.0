import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export default apiHandler({
  async GET(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, orders: orders.map(serializeOrder) });
  },
});
