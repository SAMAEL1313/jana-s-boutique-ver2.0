import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalEarnings: 0 });

  useEffect(() => {
    if (!currentUser?.isAdmin) return;
    api<Stats>("/api/admin/stats").then((data) => {
      if (data.success) setStats(data);
      else console.error("Error fetching stats:", data.message);
    });
  }, [currentUser]);

  const cards = [
    { label: "Products Purchased", value: stats.totalProducts.toLocaleString() },
    { label: "Total Orders", value: stats.totalOrders.toLocaleString() },
    { label: "Total Earnings", value: `₱${stats.totalEarnings.toLocaleString()}` },
  ];

  return (
    <AdminLayout title="Dashboard Overview">

      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card p-8">
            <p className="eyebrow">{card.label}</p>
            <p className="mt-4 font-display text-5xl font-medium text-accent">{card.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
