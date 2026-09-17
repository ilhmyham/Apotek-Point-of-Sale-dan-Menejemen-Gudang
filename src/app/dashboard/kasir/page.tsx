// src/app/dashboard/kasir/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface Product {
    id: number;
    namaProduct: string;
    harga: string;
    stok: number;
    unit: string;
    status: boolean;
}

interface CartItem {
    productId: number;
    namaProduct: string;
    harga: number;
    stok: number;
    jumlah: number;
}

interface Receipt {
    invoiceNumber: string;
    totalHarga: number;
    bayar: number;
    kembalian: number;
    items: CartItem[];
}

export default function KasirPage() {
    const { user, isLoading: authLoading } = useAuth(); // semua role boleh

    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [bayar, setBayar] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [receipt, setReceipt] = useState<Receipt | null>(null);

    const fetchProducts = useCallback(async () => {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts((data.data ?? []).filter((p: Product) => p.status));
    }, []);

    useEffect(() => {
        if (!user) return;
        const timeoutId = setTimeout(() => fetchProducts(), 0);
        return () => clearTimeout(timeoutId);
    }, [user, fetchProducts]);

    // ===== DERIVED VALUES — dihitung langsung, tanpa useState/useEffect =====
    const filteredProducts = products.filter((p) =>
        p.namaProduct.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const total = cart.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
    const bayarNumber = Number(bayar) || 0;
    const kembalian = bayarNumber - total;
    // ==========================================================================

    function addToCart(product: Product) {
        setError(null);
        const existing = cart.find((item) => item.productId === product.id);

        if (existing) {
            if (existing.jumlah >= product.stok) return; // sudah mentok stok
            setCart(cart.map((item) =>
                item.productId === product.id
                    ? { ...item, jumlah: item.jumlah + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                namaProduct: product.namaProduct,
                harga: Number(product.harga),
                stok: product.stok,
                jumlah: 1,
            }]);
        }
    }

    function updateJumlah(productId: number, newJumlah: number) {
        setCart(cart.map((item) => {
            if (item.productId !== productId) return item;
            const clamped = Math.max(1, Math.min(newJumlah, item.stok));
            return { ...item, jumlah: clamped };
        }));
    }

    function removeFromCart(productId: number) {
        setCart(cart.filter((item) => item.productId !== productId));
    }

    async function handleSubmit() {
        setError(null);

        if (cart.length === 0) {
            setError("Keranjang masih kosong");
            return;
        }
        if (bayarNumber < total) {
            setError("Uang bayar tidak cukup");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/sale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bayar: bayarNumber,
                    items: cart.map((item) => ({
                        productId: item.productId,
                        jumlah: item.jumlah,
                    })),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Transaksi gagal");
                return;
            }

            setReceipt({
                invoiceNumber: data.data.invoiceNumber,
                totalHarga: total,
                bayar: bayarNumber,
                kembalian,
                items: cart,
            });

            setCart([]);
            setBayar("");
            await fetchProducts(); // refresh stok terbaru
        } catch {
            setError("Tidak dapat terhubung ke server");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-paper"><p>Memuat...</p></div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-paper p-6 grid md:grid-cols-2 gap-6">
            {/* Kolom kiri: cari & pilih produk */}
            <div>
                <h1 className="font-display text-2xl text-ink-text mb-4">Transaksi Penjualan</h1>
                <Input
                    placeholder="Cari nama produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />

                <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {filteredProducts.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            disabled={product.stok === 0}
                            className="w-full text-left border border-ink-text/15 rounded p-3 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between"
                        >
                            <div>
                                <p className="text-ink-text">{product.namaProduct}</p>
                                <p className="text-sage text-sm">
                                    Rp{Number(product.harga).toLocaleString("id-ID")} / {product.unit}
                                </p>
                            </div>
                            <Badge variant={product.stok > 0 ? "secondary" : "destructive"}>
                                Stok: {product.stok}
                            </Badge>
                        </button>
                    ))}
                </div>
            </div>

            {/* Kolom kanan: keranjang & pembayaran */}
            <div>
                <h2 className="font-display text-xl text-ink-text mb-4">Keranjang</h2>

                {error && (
                    <div className="mb-4 text-sm text-rust border border-rust/30 bg-rust/5 rounded px-3 py-2">
                        {error}
                    </div>
                )}

                {cart.length === 0 ? (
                    <p className="text-sage">Belum ada item dipilih</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produk</TableHead>
                                <TableHead>Jumlah</TableHead>
                                <TableHead>Subtotal</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.map((item) => (
                                <TableRow key={item.productId}>
                                    <TableCell>{item.namaProduct}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.jumlah}
                                            onChange={(e) =>
                                                updateJumlah(item.productId, Number(e.target.value))
                                            }
                                            className="w-20"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        Rp{(item.harga * item.jumlah).toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="text-rust text-sm"
                                        >
                                            Hapus
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <div className="mt-6 space-y-3 border-t border-ink-text/15 pt-4">
                    <div className="flex justify-between font-display text-lg text-ink-text">
                        <span>Total</span>
                        <span>Rp{total.toLocaleString("id-ID")}</span>
                    </div>

                    <div>
                        <Label>Uang Bayar</Label>
                        <Input
                            type="number"
                            value={bayar}
                            onChange={(e) => setBayar(e.target.value)}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="flex justify-between text-ink-text">
                        <span>Kembalian</span>
                        <span className={kembalian < 0 ? "text-rust" : ""}>
                            Rp{kembalian.toLocaleString("id-ID")}
                        </span>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || cart.length === 0}
                        className="w-full bg-amber hover:bg-amber-hover text-white"
                    >
                        {isSubmitting ? "Memproses..." : "Bayar"}
                    </Button>
                </div>
            </div>

            {/* Struk sederhana setelah transaksi berhasil */}
            <Dialog open={!!receipt} onOpenChange={(open) => !open && setReceipt(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transaksi Berhasil</DialogTitle>
                    </DialogHeader>

                    {receipt && (
                        <div className="space-y-2 text-sm">
                            <p className="text-sage">{receipt.invoiceNumber}</p>
                            {receipt.items.map((item) => (
                                <div key={item.productId} className="flex justify-between">
                                    <span>{item.namaProduct} x{item.jumlah}</span>
                                    <span>Rp{(item.harga * item.jumlah).toLocaleString("id-ID")}</span>
                                </div>
                            ))}
                            <div className="border-t border-ink-text/15 pt-2 flex justify-between font-display text-lg">
                                <span>Total</span>
                                <span>Rp{receipt.totalHarga.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Bayar</span>
                                <span>Rp{receipt.bayar.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kembalian</span>
                                <span>Rp{receipt.kembalian.toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setReceipt(null)} className="w-full">
                            Transaksi Baru
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}