import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export default apiHandler({
  async GET(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const id = Number(req.query.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid customer id." });
    }

    const customer = await prisma.user.findFirst({
      where: { id, isAdmin: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        orders: { include: { items: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const { orders, ...profile } = customer;
    return res.status(200).json({ success: true, customer: profile, orders: orders.map(serializeOrder) });
  },
});
