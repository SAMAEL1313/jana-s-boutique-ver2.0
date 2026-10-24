import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseProductInput, productImageUrl } from "@/lib/productInput";
import { serializeProduct } from "@/lib/products";

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default apiHandler({
  async PUT(req, res) {
    if (!(await requireAdmin(req, res))) return;
    const id = parseId(req.query.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid product id." });

    const input = parseProductInput(req.body);
    if (typeof input === "string") {
      return res.status(400).json({ success: false, message: input });
    }
    if (!(await prisma.product.findUnique({ where: { id }, select: { id: true } }))) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const product = await prisma.$transaction(async (tx) => {
      if (input.image) {
        await tx.productImage.upsert({
          where: { productId: id },
          create: { productId: id, ...input.image },
          update: input.image,
        });
        input.data.imageUrl = productImageUrl(id);
      }
      return tx.product.update({ where: { id }, data: input.data });
    });

    return res.status(200).json({ success: true, product: serializeProduct(product) });
  },

  async DELETE(req, res) {
    if (!(await requireAdmin(req, res))) return;
    const id = parseId(req.query.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid product id." });

    // Past order items keep their name/price snapshot; product_id is set to NULL.
    const { count } = await prisma.product.deleteMany({ where: { id } });
    if (!count) return res.status(404).json({ success: false, message: "Product not found." });

    return res.status(200).json({ success: true });
  },
});
