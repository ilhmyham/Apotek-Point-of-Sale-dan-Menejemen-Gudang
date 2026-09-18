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
    expiredDate: string; // format "YYYY-MM-DD" dari <input type="date">
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

    // Derived value — dihitung ulang tiap kali `items` berubah, tanpa useState
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

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-paper"><p>Memuat...</p></div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-paper p-6">
            <div className="max-w-3xl mx-auto border-2 p-5 bg-[#FAF8F5] rounded-sm">
            <h1 className="font-display text-2xl text-ink-text mb-6">Pembelian Barang</h1>

            {error && (
                <div className="mb-4 text-sm text-rust border border-rust/30 bg-rust/5 rounded px-3 py-2">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <Label>Supplier</Label>
                <Select 
                        value={supplierId} 
                        onValueChange={(val) => setSupplierId(val ?? "")}
                    >
                    <SelectTrigger className="mt-1.5 w-full">
                        <SelectValue placeholder="Pilih supplier" />
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

            {/* Form tambah item */}
            <div className="border border-ink-text/15 rounded p-4 mb-6">
                <h2 className="text-ink-text mb-3">Tambah Item</h2>

                {itemError && (
                    <p className="text-sm text-rust mb-3">{itemError}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                        <Label>Produk</Label>
                        
                        <Select
    value={itemForm.productId}
    onValueChange={(value) => setItemForm({ ...itemForm, productId: value ?? "" })}
>
                            <SelectTrigger className="mt-1.5 w-full">
                                <SelectValue placeholder="Pilih produk" />
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

                    <div>
                        <Label>Jumlah</Label>
                        <Input
                            type="number"
                            value={itemForm.jumlah}
                            onChange={(e) => setItemForm({ ...itemForm, jumlah: e.target.value })}
                            className="mt-1.5"
                        />
                    </div>

                    <div>
                        <Label>Harga per Unit</Label>
                        <Input
                            type="number"
                            value={itemForm.hargaPerUnit}
                            onChange={(e) => setItemForm({ ...itemForm, hargaPerUnit: e.target.value })}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="col-span-2">
                        <Label>Tanggal Kadaluarsa</Label>
                        <Input
                            type="date"
                            value={itemForm.expiredDate}
                            onChange={(e) => setItemForm({ ...itemForm, expiredDate: e.target.value })}
                            className="mt-1.5"
                        />
                    </div>
                </div>

                <Button variant="outline" onClick={handleAddItem} className="w-full">
                    + Tambah ke Daftar
                </Button>
            </div>

            {/* Daftar item yang sudah ditambahkan */}
            {items.length > 0 && (
                <Table className="mb-6">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produk</TableHead>
                            <TableHead>Jumlah</TableHead>
                            <TableHead>Harga/Unit</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.namaProduct}</TableCell>
                                <TableCell>{item.jumlah}</TableCell>
                                <TableCell>Rp{item.hargaPerUnit.toLocaleString("id-ID")}</TableCell>
                                <TableCell>
                                    Rp{(item.jumlah * item.hargaPerUnit).toLocaleString("id-ID")}
                                </TableCell>
                                <TableCell>
                                    <button onClick={() => removeItem(index)} className="text-rust text-sm">
                                        Hapus
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <div className="flex justify-between font-display text-lg text-ink-text mb-4">
                <span>Total</span>
                <span>Rp{total.toLocaleString("id-ID")}</span>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || items.length === 0}
                className="w-full bg-amber hover:bg-amber-hover text-white"
            >
                {isSubmitting ? "Menyimpan..." : "Simpan Pembelian"}
            </Button>

            {/* Struk sederhana */}
            <Dialog open={!!receipt} onOpenChange={(open) => !open && setReceipt(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pembelian Berhasil</DialogTitle>
                    </DialogHeader>

                    {receipt && (
                        <div className="space-y-2 text-sm">
                            <p className="text-sage">{receipt.purchaseNumber}</p>
                            {receipt.items.map((item, i) => (
                                <div key={i} className="flex justify-between">
                                    <span>{item.namaProduct} x{item.jumlah}</span>
                                    <span>Rp{(item.jumlah * item.hargaPerUnit).toLocaleString("id-ID")}</span>
                                </div>
                            ))}
                            <div className="border-t border-ink-text/15 pt-2 flex justify-between font-display text-lg">
                                <span>Total</span>
                                <span>Rp{receipt.totalHarga.toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setReceipt(null)} className="w-full">
                            Pembelian Baru
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    );
}