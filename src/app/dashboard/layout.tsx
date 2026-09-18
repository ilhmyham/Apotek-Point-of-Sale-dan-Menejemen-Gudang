// src/app/dashboard/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar"; // Sesuaikan dengan nama file Sidebar Shadcn kamu

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            {/* Sidebar Komponen Shadcn */}
            <AppSidebar />

            <main className="flex-1 w-full bg-paper min-h-screen">
                {/* Trigger untuk buka/tutup Sidebar jika dalam mode collapsible */}
                <div className="p-4 border-b flex items-center bg-white">
                    <SidebarTrigger />
                    <span className="ml-2 font-medium text-sm text-gray-500">Dashboard Admin</span>
                </div>

                {/* Konten Halaman (produk/page.tsx, dll) */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}