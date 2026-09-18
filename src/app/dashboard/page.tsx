// src/app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
    // 1. Data user & status loading diambil cukup dari hook ini
    const { user, isLoading } = useAuth();
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ink">
                <p className="text-paper">Memuat...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-paper">
            <header className="bg-ink px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-xl text-paper">Apotek D</h1>
                    <p className="text-sage text-sm">
                        {user.nama} — {user.role === "ADMIN" ? "Administrator" : "Kasir"}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sage hover:text-paper text-sm"
                >
                    Keluar
                </button>
            </header>

            <main className="p-6">
                <h2 className="font-display text-2xl text-ink-text mb-4">Menu</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Link
                        href="/dashboard/kasir"
                        className="border border-ink-text/15 rounded p-4 hover:bg-white transition"
                    >
                        Transaksi Penjualan
                    </Link>

                    {user.role === "ADMIN" && (
                        <>
                            <Link
                                href="/dashboard/produk"
                                className="border border-ink-text/15 rounded p-4 hover:bg-white transition"
                            >
                                Kelola Produk
                            </Link>
                            <Link
                                href="/dashboard/kategori"
                                className="border border-ink-text/15 rounded p-4 hover:bg-white transition"
                            >
                                Kelola Kategori
                            </Link>
                            <Link
                                href="/dashboard/supplier"
                                className="border border-ink-text/15 rounded p-4 hover:bg-white transition"
                            >
                                Kelola Supplier
                            </Link>
                            <Link
                                href="/dashboard/pembelian"
                                className="border border-ink-text/15 rounded p-4 hover:bg-white transition"
                            >
                                Kelola Pembelian Obat
                            </Link>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}