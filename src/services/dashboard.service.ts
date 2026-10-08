import prisma from "@/lib/prisma"

const BULAN_INDONESIA = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

interface MonthlySales {
    month : string;
    penjualan : number;
    transaksi : number;
}

interface ActivityItem {
    id : string;
    user : {name: string, role: string, initials: string};
    action : string;
    target : string;
    timestamp : string;
    type : "TRANSACTION" | "PURCHASE";
}

interface SalesSummaryResult {
    months : MonthlySales[];
    growthPercent : number
}

function getInitials(name: string): string{
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatRelativeTime(date: Date): string{
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return "Baru Saja";
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    return `${Math.floor(diffHour / 24)} hari yang lalu`;
}

export const DashboardService = {
    async getSalesSummary(): Promise<SalesSummaryResult>{
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const sales = await prisma.sale.findMany({
            where : {saleDate : {gte : start}},
            select : {saleDate : true, totalHarga: true},
        });

        const months : MonthlySales[] = [];
        for(let i = 5; i >= 0; i--){
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({month: BULAN_INDONESIA[d.getMonth()], penjualan: 0, transaksi: 0});
        }

        for(const sale of sales){
            const d = new Date(sale.saleDate);
            const monthsAgo = (now.getFullYear() - d.getUTCFullYear()) * 12 + (now.getMonth() - d.getMonth());
            const index = 5 - monthsAgo;
            if(index < 0 || index > 5) continue;

            months[index].penjualan += Number(sale.totalHarga);
            months[index].transaksi += 1;
        }

        const lastMonth = months[5].penjualan;
        const prevMonth = months[4].penjualan;

        let growthPercent = 0;
        if(prevMonth > 0){
            growthPercent = ((lastMonth - prevMonth) / prevMonth) * 100;
        }else{
            growthPercent = 100
        }

        return {months, growthPercent : Math.round(growthPercent * 10) / 10 };
    },

    async getRecentActivity(limit = 10): Promise<ActivityItem[]> {
        const [sales, purchases] = await Promise.all([
            prisma.sale.findMany({ take: limit, orderBy: { saleDate: "desc" }, include: { user: true } }),
            prisma.purchase.findMany({ take: limit, orderBy: { purchaseDate: "desc" }, include: { user: true } }),
        ]);

        const combined = [
            ...sales.map((sale) => ({
                rawDate: sale.saleDate,
                item: {
                    id: `sale-${sale.id}`,
                    user: {
                        name: sale.user.nama,
                        role: sale.user.role === "ADMIN" ? "Admin" : "Kasir",
                        initials: getInitials(sale.user.nama),
                    },
                    action: `Melakukan transaksi penjualan sebesar Rp ${Number(sale.totalHarga).toLocaleString("id-ID")}`,
                    target: sale.invoiceNumber,
                    type: "TRANSACTION" as const,
                },
            })),
            ...purchases.map((purchase) => ({
                rawDate: purchase.purchaseDate,
                item: {
                    id: `purchase-${purchase.id}`,
                    user: {
                        name: purchase.user.nama,
                        role: purchase.user.role === "ADMIN" ? "Admin" : "Kasir",
                        initials: getInitials(purchase.user.nama),
                    },
                    action: `Melakukan pembelian stok sebesar Rp ${Number(purchase.totalHarga).toLocaleString("id-ID")}`,
                    target: purchase.purchaseNumber,
                    type: "PURCHASE" as const,
                },
            })),
        ];

        return combined
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
            .slice(0, limit)
            .map(({ item, rawDate }) => ({ ...item, timestamp: formatRelativeTime(rawDate) }));
    },
}