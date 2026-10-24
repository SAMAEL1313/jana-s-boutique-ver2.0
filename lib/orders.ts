import type { Order, OrderItem } from "@/generated/prisma/client";
import type { OrderDTO } from "@/types";

export function serializeOrder(order: Order & { items: OrderItem[] }): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    firstName: order.firstName,
    lastName: order.lastName,
    address: order.address,
    city: order.city,
    province: order.province,
    zip: order.zip,
    phone: order.phone,
    paymentMethod: order.paymentMethod,
    shippingCost: Number(order.shippingCost),
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      imageUrl: item.imageUrl,
      size: item.size,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
}
