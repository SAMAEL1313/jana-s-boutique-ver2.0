import crypto from "node:crypto";
import { apiHandler, str } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { receiptEmail, sendMail } from "@/lib/mailer";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { parseFeatures, SHIPPING_COST } from "@/lib/products";

class CheckoutError extends Error {}

const PAYMENT_METHODS = ["GCash"];

export default apiHandler({
  async POST(req, res) {
    const user = await requireUser(req, res);
    if (!user) return;

    const b = req.body ?? {};
    const shipping = {
      firstName: str(b.firstName),
      lastName: str(b.lastName),
      address: str(b.address),
      city: str(b.city),
      province: str(b.province),
      zip: str(b.zip),
      phone: str(b.phone),
      country: str(b.country) || "Philippines",
    };
    if (Object.values(shipping).some((v) => !v)) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields!" });
    }

    const paymentMethod = str(b.paymentMethod);
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Unsupported payment method." });
    }

    const requested: { productId: number; quantity: number; size: string | null }[] = Array.isArray(b.items)
      ? b.items.map((i: Record<string, unknown>) => ({
          productId: Number(i?.productId),
          quantity: Number(i?.quantity),
          size: str(i?.size) || null,
        }))
      : [];
    if (
      requested.length === 0 ||
      requested.some((i) => !Number.isInteger(i.productId) || !Number.isInteger(i.quantity) || i.quantity < 1)
    ) {
      return res.status(400).json({ success: false, message: "Your cart is empty!" });
    }

    try {
      const order = await prisma.$transaction(async (tx) => {
        const products = await tx.product.findMany({
          where: { id: { in: requested.map((i) => i.productId) } },
        });
        const byId = new Map(products.map((p) => [p.id, p]));

        const items = [];
        for (const line of requested) {
          const product = byId.get(line.productId);
          if (!product) throw new CheckoutError("A product in your cart is no longer available.");

          // Decrement only if enough stock remains, so concurrent orders can't oversell.
          const { count } = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (!count) throw new CheckoutError(`Not enough stock for ${product.name}.`);

          // Prices always come from the database, never from the client.
          const sizePrice = line.size ? parseFeatures(product.features)?.[line.size] : undefined;
          items.push({
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            size: line.size,
            quantity: line.quantity,
            unitPrice: sizePrice ?? Number(product.price),
          });
        }

        const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

        return tx.order.create({
          data: {
            ...shipping,
            orderNumber: `ORD-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
            billingId: `BILL-${crypto.randomInt(100000, 999999)}`,
            userId: user.id,
            email: user.email,
            paymentMethod,
            shippingCost: SHIPPING_COST,
            totalAmount: subtotal + SHIPPING_COST,
            items: { create: items },
          },
          include: { items: true },
        });
      });

      const dto = serializeOrder(order);

      // The order is already saved; a failed receipt email shouldn't fail checkout.
      sendMail(dto.email, `Your Jana Boutique receipt — ${dto.orderNumber}`, receiptEmail(dto)).catch((err) =>
        console.error("Failed to send receipt:", err)
      );

      return res.status(201).json({ success: true, order: dto });
    } catch (err) {
      if (err instanceof CheckoutError) {
        return res.status(409).json({ success: false, message: err.message });
      }
      throw err;
    }
  },
});
