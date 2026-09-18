// src/components/app-sidebar.tsx
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
    const pathname = usePathname();
    
    // Destructuring langsung dari useAuth tanpa casting ke 'any'
    const { user, handleLogout } = useAuth() as {
        user: { role: string } | null;
        handleLogout?: () => void;
        logout?: () => void;
        signOut?: () => void;
    };

    // Menentukan fungsi logout yang tersedia
    const onLogout = handleLogout;

    if (!user) return null;

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-3">
                <div className="font-bold text-lg text-slate-800">Apotek POS</div>
                <div className="text-xs text-slate-500">Role: {user.role}</div>
            </SidebarHeader>

            <SidebarContent className="p-2">
                <SidebarMenu>
                    {/* Menu Kasir */}
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            isActive={pathname === "/dashboard/kasir"}
                        >
                            <Link href="/dashboard/kasir" className="w-full">
                                Transaksi Penjualan
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Menu Admin */}
                    {user.role === "ADMIN" && (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={pathname === "/dashboard/produk"}>
                                    <Link href="/dashboard/produk" className="w-full">
                                        Kelola Produk
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={pathname === "/dashboard/kategori"}>
                                    <Link href="/dashboard/kategori" className="w-full">
                                        Kelola Kategori
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={pathname === "/dashboard/supplier"}>
                                    <Link href="/dashboard/supplier" className="w-full">
                                        Kelola Supplier
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={pathname === "/dashboard/pembelian"}>
                                    <Link href="/dashboard/pembelian" className="w-full">
                                        Kelola Pembelian Obat
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t p-3">
                <Button 
                    variant="destructive" 
                    className="w-full justify-start" 
                    onClick={onLogout}
                >
                    Keluar
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}