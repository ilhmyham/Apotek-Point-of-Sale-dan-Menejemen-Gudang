"use client";

import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface SaleDetail {
    id: number;
    jumlah: number;
    harga: string;
    subtotal: string;
    product: { namaProduct: string };
}

interface Sale {
    id: number;
    invoiceNumber: string;
    saleDate: string;
    totalHarga: string;
    bayar: string;
    kembalian: string;
    user: { nama: string };
    saleDetails: SaleDetail[];
}

export default function RiwayatPenjualanPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<Sale | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            const res = await fetch("/api/sale");
            const data = await res.json();
            setSales(data.data ?? []);
            setIsLoading(false);
        }, 0);
        return () => clearTimeout(timeoutId);
    }, []);

    if (isLoading) return <p className="p-6 text-sage">Memuat...</p>;

    return (
        <div className="p-6">
            <h1 className="font-display text-2xl text-ink-text mb-6">Riwayat Penjualan</h1>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kasir</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.map((sale) => (
                        <TableRow key={sale.id}>
                            <TableCell>{sale.invoiceNumber}</TableCell>
                            <TableCell>
                                {new Date(sale.saleDate).toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>{sale.user.nama}</TableCell>
                            <TableCell>
                                Rp{Number(sale.totalHarga).toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => setSelected(sale)}>
                                    Detail
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selected?.invoiceNumber}</DialogTitle>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-2 text-sm">
                            {selected.saleDetails.map((detail) => (
                                <div key={detail.id} className="flex justify-between">
                                    <span>{detail.product.namaProduct} x{detail.jumlah}</span>
                                    <span>Rp{Number(detail.subtotal).toLocaleString("id-ID")}</span>
                                </div>
                            ))}
                            <div className="border-t border-ink-text/15 pt-2 flex justify-between font-display text-lg">
                                <span>Total</span>
                                <span>Rp{Number(selected.totalHarga).toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Bayar</span>
                                <span>Rp{Number(selected.bayar).toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kembalian</span>
                                <span>Rp{Number(selected.kembalian).toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}