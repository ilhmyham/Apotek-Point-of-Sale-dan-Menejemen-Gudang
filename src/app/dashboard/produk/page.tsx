// src/app/dashboard/produk/page.tsx
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
    AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
    AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PATCH } from "@/app/api/products/[id]/deactive/route";

interface Product {
    id: number;
    namaProduct: string;
    harga: string;      // Decimal dari Prisma dikirim sebagai string
    stok: number;
    unit: string;
    status: boolean;
    categoryId: number;
    supplierId: number;
}

interface Category {
    id: number;
    namaCategory: string;
}

interface Supplier {
    id: number;
    namaSupplier: string;
}

const emptyForm = {
    namaProduct: "",
    harga: "",
    stok: "",
    unit: "",
    categoryId: "",
    supplierId: "",
};

export default function ProdukPage() {
    const { user, isLoading: authLoading } = useAuth("ADMIN");

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    const fetchAll = useCallback(async () => {
        setIsLoadingList(true);

        // Fetch 3 sumber data BERSAMAAN, bukan satu-satu
        const [productRes, categoryRes, supplierRes] = await Promise.all([
            fetch("/api/products"),
            fetch("/api/category"),
            fetch("/api/supplier"),
        ]);

        const productData = await productRes.json();
        const categoryData = await categoryRes.json();
        const supplierData = await supplierRes.json();

        setProducts(productData.data ?? []);
        setCategories(categoryData.data ?? []);
        setSuppliers(supplierData.data ?? []);
        setIsLoadingList(false);
    }, []);

    useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
        fetchAll();
    }, 0);

    return () => clearTimeout(timeoutId);
}, [user, fetchAll]);

    function openCreateForm() {
        setEditingId(null);
        setForm(emptyForm);
        setFormError(null);
        setIsFormOpen(true);
    }

    function openEditForm(product: Product) {
        setEditingId(product.id);
        setForm({
            namaProduct: product.namaProduct,
            harga: product.harga,
            stok: String(product.stok),
            unit: product.unit,
            categoryId: String(product.categoryId),
            supplierId: String(product.supplierId),
        });
        setFormError(null);
        setIsFormOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        const isEdit = editingId !== null;
        const url = isEdit ? `/api/products/${editingId}` : "/api/products";
        const method = isEdit ? "PUT" : "POST";

        // Konversi dari string (input HTML) ke tipe yang backend harapkan
        const payload = {
            namaProduct: form.namaProduct,
            harga: Number(form.harga),
            stok: Number(form.stok),
            unit: form.unit,
            categoryId: Number(form.categoryId),
            supplierId: Number(form.supplierId),
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error ?? "Gagal menyimpan produk");
                return;
            }

            setIsFormOpen(false);
            await fetchAll();
        } catch {
            setFormError("Tidak dapat terhubung ke server");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;

        const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
        const data = await res.json();

        if (!res.ok) {
            alert(data.error); // sementara pakai alert, bisa dipercantik nanti
        } else {
            await fetchAll();
        }
        setDeleteTarget(null);
    }

    async function handleDeactivate(id: number) {
        await fetch(`/api/products/${id}/deactive`, { method: "PATCH" });
        await fetchAll();
    }

    async function handleActive(id: number) {
        await fetch(`/api/products/${id}/active`, {method: "PATCH"});
        await fetchAll();
    }

    function getCategoryName(id: number) {
        return categories.find((c) => c.id === id)?.namaCategory ?? "-";
    }

    function getSupplierName(id: number) {
        return suppliers.find((s) => s.id === id)?.namaSupplier ?? "-";
    }

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-paper"><p>Memuat...</p></div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-paper p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl text-ink-text">Kelola Produk</h1>
                <Button onClick={openCreateForm} className="bg-amber hover:bg-amber-hover text-white">
                    + Tambah Produk
                </Button>
            </div>

            {isLoadingList ? (
                <p className="text-sage">Memuat data...</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.namaProduct}</TableCell>
                                <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                                <TableCell>{getSupplierName(product.supplierId)}</TableCell>
                                <TableCell>Rp{Number(product.harga).toLocaleString("id-ID")}</TableCell>
                                <TableCell>{product.stok} {product.unit}</TableCell>
                                <TableCell>
                                    <span className={product.status ? "text-green-700" : "text-sage"}>
                                        {product.status ? "Aktif" : "Nonaktif"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditForm(product)}>
                                        Edit
                                    </Button>
                                     {product.status ? (
        <Button variant="outline" size="sm" onClick={() => handleDeactivate(product.id)}>
            Nonaktifkan
        </Button>
    ) : (
        <Button variant="outline" size="sm" onClick={() => handleActive(product.id)}>
            Aktifkan
        </Button>
    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-rust hover:text-rust"
                                        onClick={() => setDeleteTarget(product)}
                                    >
                                        Hapus
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="text-sm text-rust border border-rust/30 bg-rust/5 rounded px-3 py-2">
                                {formError}
                            </div>
                        )}

                        <div>
                            <Label>Nama Produk</Label>
                            <Input
                                value={form.namaProduct}
                                onChange={(e) => setForm({ ...form, namaProduct: e.target.value })}
                                required
                                className="mt-1.5"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Harga</Label>
                                <Input
                                    type="number"
                                    value={form.harga}
                                    onChange={(e) => setForm({ ...form, harga: e.target.value })}
                                    required
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Stok</Label>
                                <Input
                                    type="number"
                                    value={form.stok}
                                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                                    required
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Unit</Label>
                            <Input
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                placeholder="contoh: strip, botol, box"
                                required
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label>Kategori</Label>
                            <Select
                                    value={form.categoryId ? String(form.categoryId) : ""}
                                    onValueChange={(val) => setForm({ ...form, categoryId: val ?? "" })}
                                >
                                <SelectTrigger className="mt-1.5 w-full">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.namaCategory}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Supplier</Label>
                            <Select
                                    value={form.supplierId || undefined}
                                    onValueChange={(val) => setForm({ ...form, supplierId: val ?? "" })}
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

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting} className="bg-amber hover:bg-amber-hover text-white">
                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus produk ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Produk &quot;{deleteTarget?.namaProduct}&quot; akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rust hover:bg-rust/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}