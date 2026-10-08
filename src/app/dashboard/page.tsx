"use client";
import { SalesChart } from "@/components/sales-chart";

import { ActivityLog, ActivityItem } from "@/components/activity-log";

import { useState, useEffect } from "react";

interface MonthlySales {
  month : string;
  penjualan : number;
  transaksi : number;
}

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<MonthlySales[]>([]);
  const [growthPercent, setGrowthPercent] = useState(0); 
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
        const timeoutId = setTimeout(async () => {
            const [salesRes, activityRes] = await Promise.all([
                fetch("/api/dashboard/sales-summary"),
                fetch("/api/dashboard/activity"),
            ]);
            const salesJson = await salesRes.json();
            const activityJson = await activityRes.json();
            setSalesData(salesJson.data.months ?? []);
            setGrowthPercent(salesJson.data.growthPercent ?? 0);
            setActivities(activityJson.data ?? []);
            setIsLoading(false);

            
        }, 0);

        return () => clearTimeout(timeoutId);
    }, []);

     if (isLoading) return <p className="p-6 text-sage">Memuat dashboard...</p>;
  return (
  <div className="p-4 md:p-6 space-y-6">
      {/* Header Dashboard */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard Penjualan
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan grafik transaksi dan riwayat aktivitas terbaru sistem POS.
        </p>
      </div>

      {/* Grid Layout: Otomatis membagi tinggi yang sama (stretch) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesData} growthPercent={growthPercent}/>
        </div>

        <div className="lg:col-span-1">
          <ActivityLog activities={activities} />
        </div>
      </div>
    </div>
  );
}