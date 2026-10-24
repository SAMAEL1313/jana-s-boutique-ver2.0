import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsPerson } from "react-icons/bs";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import type { CustomerDTO, OrderDTO } from "@/types";

export default function CustomerProfile() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const id = router.query.id;
  const [customer, setCustomer] = useState<CustomerDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.isAdmin || typeof id !== "string") return;
    api<{ customer: CustomerDTO; orders: OrderDTO[] }>(`/api/admin/customers/${id}`).then((data) => {
      if (data.success) {
        setCustomer(data.customer);
        setOrders(data.orders);
      } else {
        setError(data.message);
      }
      setLoading(false);
    });
  }, [currentUser, id]);

  return (
    <AdminLayout title="Customer Profile">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/admin/customers" className="mb-6 inline-flex items-center gap-2 text-muted transition-colors hover:text-gold">
          <AiOutlineArrowLeft size={20} /> Back to customers
        </Link>

        {loading ? (
          <p>Loading customer info...</p>
        ) : !customer ? (
          <p>{error || "Customer not found."}</p>
        ) : (
          <>
            <h1 className="mb-6 flex items-center gap-3 font-display text-4xl font-medium">
              <BsPerson size={30} className="text-gold" />
              {customer.firstName} {customer.lastName}
            </h1>

            <div className="card space-y-4 p-8">
              <p className="text-muted">
                <strong>Email:</strong> {customer.email}
              </p>

              <h3 className="eyebrow mt-6">Orders</h3>

              {orders.length > 0 ? (
                <div className="max-h-[400px] space-y-4 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="border-b border-line pb-3 last:border-b-0">
                      <p className="mb-1 text-sm text-muted">
                        Order {order.orderNumber} - Date: {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <p className="mb-1 text-sm text-muted">Total: ₱{order.totalAmount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No orders yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
