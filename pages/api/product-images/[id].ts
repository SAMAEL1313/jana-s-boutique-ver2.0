import { apiHandler } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export default apiHandler({
  async GET(req, res) {
    const productId = Number(req.query.id);
    if (!Number.isInteger(productId)) return res.status(400).end();

    const image = await prisma.productImage.findUnique({ where: { productId } });
    if (!image) return res.status(404).end();

    res.setHeader("Content-Type", image.mimeType);
    // URLs carry a ?v= version, so the bytes behind a given URL never change.
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.status(200).send(Buffer.from(image.data));
  },
});
