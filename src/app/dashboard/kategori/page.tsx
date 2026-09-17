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

interface Category {
    id: number;
    namaCategory: string;
}

export default function KategoriPage() {
    const { user, isLoading: authLoading } = useAuth("ADMIN");

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);

    // State untuk dialog tambah/edit
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [namaCategory, setNamaCategory] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State untuk konfirmasi hapus
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoadingList(true);
        const res = await fetch("/api/category");
        const data = await res.json();
        setCategories(data.data ?? []);
        setIsLoadingList(false);
    }, []);

    useEffect(() => {
    // Jika user belum ada, jangan lakukan apa-apa
    if (!user) return;

    let isMounted = true;

    async function getCategories() {
        setIsLoadingList(true);
        try {
            const res = await fetch("/api/category");
            const data = await res.json();
            if (isMounted) {
                setCategories(data.data ?? []);
            }
        } catch {
            console.error("Gagal mengambil data kategori");
        } finally {
            if (isMounted) {
                setIsLoadingList(false);
            }
        }
    }

    getCategories();

    return () => {
        isMounted = false;
    };
}, [user]);

    function openCreateForm() {
        setEditingId(null);
        setNamaCategory("");
        setFormError(null);
        setIsFormOpen(true);
    }

    function openEditForm(category: Category) {
        setEditingId(category.id);
        setNamaCategory(category.namaCategory);
        setFormError(null);
        setIsFormOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        const isEdit = editingId !== null;
        const url = isEdit ? `/api/category/${editingId}` : "/api/category";
        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ namaCategory }),
            });

            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error ?? "Gagal menyimpan kategori");
                return;
            }

            setIsFormOpen(false);
            await fetchCategories();
        } catch {
            setFormError("Tidak dapat terhubung ke server");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;

        const res = await fetch(`/api/category/${deleteTarget.id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            await fetchCategories();
        }
        setDeleteTarget(null);
    }

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-paper"><p>Memuat...</p></div>;
    }
    if (!user) return null;

    return (
        <div className="min-h-screen bg-paper p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl text-ink-text">Kelola Kategori</h1>
                <Button onClick={openCreateForm} className="bg-amber hover:bg-amber-hover text-white">
                    + Tambah Kategori
                </Button>
            </div>

            {isLoadingList ? (
                <p className="text-sage">Memuat data...</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Kategori</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>{category.namaCategory}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditForm(category)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-rust hover:text-rust"
                                        onClick={() => setDeleteTarget(category)}
                                    >
                                        Hapus
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Dialog Tambah/Edit */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="text-sm text-rust border border-rust/30 bg-rust/5 rounded px-3 py-2">
                                {formError}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="namaCategory">Nama Kategori</Label>
                            <Input
                                id="namaCategory"
                                value={namaCategory}
                                onChange={(e) => setNamaCategory(e.target.value)}
                                autoFocus
                                required
                                className="mt-1.5"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting} className="bg-amber hover:bg-amber-hover text-white">
                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Konfirmasi Hapus */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus kategori ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Kategori &quot;{deleteTarget?.namaCategory}&quot; akan dihapus permanen.
                            Tindakan ini tidak bisa dibatalkan.
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