// src/app/dashboard/pembelian/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ShoppingCart, ReceiptText, AlertCircle } from "lucide-react";

interface Product {
    id: number;
    namaProduct: string;
    unit: string;
}

interface Supplier {
    id: number;
    namaSupplier: string;
}

interface PurchaseItem {
    productId: number;
    namaProduct: string;
    jumlah: number;
    hargaPerUnit: number;
    expiredDate: string;
}

interface Receipt {
    purchaseNumber: string;
    totalHarga: number;
    items: PurchaseItem[];
}

const emptyItemForm = { productId: "", jumlah: "", hargaPerUnit: "", expiredDate: "" };

export default function PembelianPage() {
    const { user, isLoading: authLoading } = useAuth("ADMIN");

    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [supplierId, setSupplierId] = useState("");
    const [items, setItems] = useState<PurchaseItem[]>([]);
    const [itemForm, setItemForm] = useState(emptyItemForm);
    const [error, setError] = useState<string | null>(null);
    const [itemError, setItemError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [receipt, setReceipt] = useState<Receipt | null>(null);

    const fetchData = useCallback(async () => {
        const [productRes, supplierRes] = await Promise.all([
            fetch("/api/products"),
            fetch("/api/supplier"),
        ]);
        const productData = await productRes.json();
        const supplierData = await supplierRes.json();
        setProducts(productData.data ?? []);
        setSuppliers(supplierData.data ?? []);
    }, []);

    useEffect(() => {
        if (!user) return;
        const timeoutId = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timeoutId);
    }, [user, fetchData]);

    const total = items.reduce((sum, item) => sum + item.jumlah * item.hargaPerUnit, 0);

    function handleAddItem() {
        setItemError(null);

        if (!itemForm.productId || !itemForm.jumlah || !itemForm.hargaPerUnit || !itemForm.expiredDate) {
            setItemError("Semua field item wajib diisi");
            return;
        }

        const product = products.find((p) => p.id === Number(itemForm.productId));
        if (!product) return;

        setItems([...items, {
            productId: product.id,
            namaProduct: product.namaProduct,
            jumlah: Number(itemForm.jumlah),
            hargaPerUnit: Number(itemForm.hargaPerUnit),
            expiredDate: itemForm.expiredDate,
        }]);

        setItemForm(emptyItemForm);
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        setError(null);

        if (!supplierId) {
            setError("Pilih supplier terlebih dahulu");
            return;
        }
        if (items.length === 0) {
            setError("Minimal harus ada 1 item pembelian");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplierId: Number(supplierId),
                    items: items.map((item) => ({
                        productId: item.productId,
                        jumlah: item.jumlah,
                        hargaPerUnit: item.hargaPerUnit,
                        expiredDate: item.expiredDate,
                    })),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Gagal menyimpan pembelian");
                return;
            }

            setReceipt({
                purchaseNumber: data.data.purchaseNumber,
                totalHarga: total,
                items,
            });

            setItems([]);
            setSupplierId("");
        } catch {
            setError("Tidak dapat terhubung ke server");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (authLoading) return <div className="h-full flex items-center justify-center text-ink-text/60"><p>Memuat data...</p></div>;
    if (!user) return null;

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-10">
            {/* Header Section */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-lg text-slate-700">
                    <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-semibold text-ink-text">Catat Pembelian</h1>
                    <p className="text-sm text-ink-text/60 mt-1">Masukkan detail stok barang masuk dari supplier.</p>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-rust border-l-4 border-rust bg-rust/5 px-4 py-3">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Form Section */}
            <div className="space-y-8">
                {/* Section Supplier */}
                <div className="space-y-3">
                    <Label className="text-ink-text text-base font-semibold">1. Pilih Supplier</Label>
                    <Select 
                        value={supplierId} 
                        onValueChange={(val) => setSupplierId(val ?? "")}
                    >
                        <SelectTrigger className="w-full md:w-1/2 bg-white">
                            <SelectValue placeholder="-- Pilih Supplier --" />
                        </SelectTrigger>
                        <SelectContent>
                            {suppliers.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                    {s.namaSupplier}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <hr className="border-slate-200/60" />

                {/* Form Tambah Item */}
                <div className="space-y-4">
                    <h2 className="text-base font-semibold text-ink-text flex items-center gap-2">
                        2. Tambah Item Produk
                    </h2>

                    {itemError && (
                        <p className="text-sm text-rust bg-rust/5 px-3 py-2 inline-block rounded">{itemError}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                            <Label className="mb-1.5 block text-ink-text/80 text-xs uppercase tracking-wider">Produk</Label>
                            <Select
                                items={products.map((c) => ({ value: String(c.id), label: c.namaProduct }))}
                                value={itemForm.productId || null}
                                onValueChange={(value) => setItemForm({ ...itemForm, productId: value ?? "" })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Cari produk..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.namaProduct}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2">
                            <Label className="mb-1.5 block text-ink-text/80 text-xs uppercase tracking-wider">Jumlah</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={itemForm.jumlah}
                                onChange={(e) => setItemForm({ ...itemForm, jumlah: e.target.value })}
                                className="bg-white"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Label className="mb-1.5 block text-ink-text/80 text-xs uppercase tracking-wider">Harga per Unit</Label>
                            <Input
                                type="number"
                                placeholder="Rp 0"
                                value={itemForm.hargaPerUnit}
                                onChange={(e) => setItemForm({ ...itemForm, hargaPerUnit: e.target.value })}
                                className="bg-white"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Label className="mb-1.5 block text-ink-text/80 text-xs uppercase tracking-wider">Kadaluarsa</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={itemForm.expiredDate}
                                    onChange={(e) => setItemForm({ ...itemForm, expiredDate: e.target.value })}
                                    className="bg-white"
                                />
                                <Button 
                                    variant="outline" 
                                    onClick={handleAddItem} 
                                    className="px-3 shrink-0 text-amber border-amber hover:bg-amber hover:text-white transition-colors"
                                    title="Tambah"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daftar Item */}
                <div className="pt-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-slate-200">
                                <TableHead className="font-semibold text-ink-text">Produk</TableHead>
                                <TableHead className="font-semibold text-ink-text text-center">Jumlah</TableHead>
                                <TableHead className="font-semibold text-ink-text text-right">Harga/Unit</TableHead>
                                <TableHead className="font-semibold text-ink-text text-right">Subtotal</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-ink-text/40 bg-slate-50/50 italic">
                                        Daftar pembelian masih kosong.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, index) => (
                                    <TableRow key={index} className="group border-b border-slate-100">
                                        <TableCell className="font-medium">{item.namaProduct}</TableCell>
                                        <TableCell className="text-center">{item.jumlah}</TableCell>
                                        <TableCell className="text-right">Rp {item.hargaPerUnit.toLocaleString("id-ID")}</TableCell>
                                        <TableCell className="text-right font-medium text-amber">
                                            Rp {(item.jumlah * item.hargaPerUnit).toLocaleString("id-ID")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <button 
                                                onClick={() => removeItem(index)} 
                                                className="text-slate-400 hover:text-rust transition-colors p-2 rounded hover:bg-rust/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Hapus Item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Footer / Total & Submit */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6 border-t-2 border-slate-200">
                <div>
                    <p className="text-sm text-ink-text/60 mb-1 uppercase tracking-wider font-semibold">Total Pembayaran</p>
                    <p className="font-display text-4xl font-bold text-ink-text">
                        Rp {total.toLocaleString("id-ID")}
                    </p>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || items.length === 0}
                    className="w-full md:w-auto min-w-[200px] h-12 bg-slate-700 hover:bg-amber/90 text-white"
                >
                    {isSubmitting ? "Memproses..." : "Simpan Transaksi"}
                </Button>
            </div>  

            {/* Dialog Struk */}
            <Dialog open={!!receipt} onOpenChange={(open) => !open && setReceipt(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center mb-4">
                        <div className="mx-auto w-12 h-12 bg-sage/10 text-sage rounded-full flex items-center justify-center mb-3">
                            <ReceiptText className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-xl font-display text-ink-text">Pembelian Berhasil</DialogTitle>
                        <p className="text-sm text-ink-text/60">No. Ref: <span className="font-medium text-sage">{receipt?.purchaseNumber}</span></p>
                    </DialogHeader>

                    {receipt && (
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg space-y-3 text-sm mb-4">
                            {receipt.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-ink-text">{item.namaProduct}</p>
                                        <p className="text-ink-text/60 text-xs">{item.jumlah} x Rp{item.hargaPerUnit.toLocaleString("id-ID")}</p>
                                    </div>
                                    <span className="font-medium text-ink-text">
                                        Rp{(item.jumlah * item.hargaPerUnit).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-dashed border-slate-300 pt-3 mt-3 flex justify-between items-center">
                                <span className="font-semibold text-ink-text">Total</span>
                                <span className="font-bold text-lg text-amber">
                                    Rp{receipt.totalHarga.toLocaleString("id-ID")}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setReceipt(null)} className="w-full bg-ink-text text-white hover:bg-ink-text/90">
                            Selesai & Buat Baru
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}