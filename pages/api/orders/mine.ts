import { apiHandler } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export default apiHandler({
  async GET(req, res) {
    const user = await requireUser(req, res);
    if (!user) return;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, orders: orders.map(serializeOrder) });
  },
});
