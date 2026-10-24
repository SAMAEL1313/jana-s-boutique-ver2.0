import { apiHandler, str } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseProductInput, productImageUrl } from "@/lib/productInput";
import { serializeProduct } from "@/lib/products";

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

export default apiHandler({
  async GET(req, res) {
    const category = str(req.query.category).toLowerCase() || undefined;
    const subcategory = str(req.query.subcategory).toLowerCase() || undefined;

    const rows = await prisma.product.findMany({
      where: { category, subcategory },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({ success: true, products: rows.map(serializeProduct) });
  },

  async POST(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const input = parseProductInput(req.body);
    if (typeof input === "string") {
      return res.status(400).json({ success: false, message: input });
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: input.data });
      if (!input.image) return created;
      await tx.productImage.create({ data: { productId: created.id, ...input.image } });
      return tx.product.update({
        where: { id: created.id },
        data: { imageUrl: productImageUrl(created.id) },
      });
    });

    return res.status(201).json({ success: true, product: serializeProduct(product) });
  },
});
