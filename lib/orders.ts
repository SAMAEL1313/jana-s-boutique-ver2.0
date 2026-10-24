import type { OrderDTO } from "@/types";
import type { Row } from "@/types/supabase";

/** Columns to select for an order with its line items. */
export const ORDER_WITH_ITEMS = "*, order_items(*)";

export function serializeOrder(order: Row<"orders"> & { order_items: Row<"order_items">[] }): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.order_number,
    email: order.email,
    firstName: order.first_name,
    lastName: order.last_name,
    address: order.address,
    city: order.city,
    province: order.province,
    zip: order.zip,
    phone: order.phone,
    paymentMethod: order.payment_method,
    shippingCost: Number(order.shipping_cost),
    totalAmount: Number(order.total_amount),
    createdAt: new Date(order.purchase_date).toISOString(),
    items: order.order_items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      imageUrl: item.image_url,
      size: item.size,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })),
  };
}
