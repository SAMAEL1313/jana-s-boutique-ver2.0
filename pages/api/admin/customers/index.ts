import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default apiHandler({
  async GET(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const customers = await prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, customers });
  },
});
