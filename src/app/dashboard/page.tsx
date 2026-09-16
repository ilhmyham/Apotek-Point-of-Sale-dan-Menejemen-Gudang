// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 1. Import Link

interface UserProfile {
    id: number;
    username: string;
    nama: string;
    role: "USER" | "ADMIN";
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchProfile() {
            try {
                const res = await fetch("/api/auth/me");

                if (!res.ok) {
                    router.push("/login");
                    return;
                }

                const data = await res.json();
                if (isMounted) setUser(data.data);
            } catch {
                router.push("/login");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [router]);

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
                    {/* 2. Penggunaan Link yang benar */}
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
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}