import { useEffect, useState } from "react";
import Link from "next/link";
import { BsPerson } from "react-icons/bs";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import type { CustomerDTO } from "@/types";

export default function AdminCustomers() {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!currentUser?.isAdmin) return;
    api<{ customers: CustomerDTO[] }>("/api/admin/customers").then((data) => {
      if (data.success) setCustomers(data.customers);
      else console.error("Error fetching customers:", data.message);
    });
  }, [currentUser]);

  const q = searchQuery.toLowerCase();
  const filteredCustomers = customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );

  return (
    <AdminLayout title="Customers">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted">{filteredCustomers.length} customer{filteredCustomers.length === 1 ? "" : "s"}</p>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="text-muted italic">No customers found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="card p-5 transition-shadow hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
                  <BsPerson size={22} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {customer.firstName} {customer.lastName}
                  </h2>
                  <p className="text-sm text-muted">{customer.email}</p>
                </div>
              </div>

              <Link
                href={`/admin/customers/${customer.id}`}
                className="btn-outline mt-4 !px-3 !py-1.5 !text-xs"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
