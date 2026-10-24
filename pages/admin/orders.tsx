import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import ProductPhoto from "@/components/ProductPhoto";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import type { OrderDTO } from "@/types";

const th = "px-4 py-3 text-left font-display text-xs font-semibold tracking-[0.2em] text-muted uppercase";
const td = "px-4 py-3 align-top";

export default function AdminOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);

  useEffect(() => {
    if (!currentUser?.isAdmin) return;
    api<{ orders: OrderDTO[] }>("/api/orders").then((data) => {
      if (data.success) setOrders(data.orders);
      else console.error("Error fetching orders:", data.message);
    });
  }, [currentUser]);

  return (
    <AdminLayout title="Orders">

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-surface-2">
            <tr>
              {["Order", "Email", "Products", "Total Amount", "Shipping", "Payment", "Date", "Name", "Address", "Phone"].map(
                (h) => (
                  <th key={h} className={th}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-line bg-surface text-ink">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-4 text-center text-muted">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-2">
                  <td className={td}>{order.orderNumber}</td>
                  <td className={td}>{order.email}</td>
                  <td className={td}>
                    <div className="flex flex-col gap-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="relative h-10 w-10 flex-shrink-0">
                            <ProductPhoto src={item.imageUrl} alt={item.name} fill sizes="40px" className="rounded-sm object-cover" />
                          </div>
                          <span className="text-sm">
                            {item.name}
                            {item.size ? ` (${item.size})` : ""} x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={td}>₱{order.totalAmount.toLocaleString()}</td>
                  <td className={td}>₱{order.shippingCost.toLocaleString()}</td>
                  <td className={td}>{order.paymentMethod}</td>
                  <td className={td}>{new Date(order.createdAt).toLocaleString()}</td>
                  <td className={td}>
                    {order.firstName} {order.lastName}
                  </td>
                  <td className={td}>
                    {order.address}, {order.city}, {order.province}, {order.zip}
                  </td>
                  <td className={td}>{order.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
