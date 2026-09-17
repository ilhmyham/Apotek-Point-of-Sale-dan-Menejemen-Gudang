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

interface Supplier {
    id: number;
    namaSupplier : string;
    alamat : string;
    telepon : string;
}

export default function SupplierPage(){
    const { user, isLoading: authLoading } = useAuth("ADMIN");

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [namaSupplier, setNamaSupplier] = useState("")
    const [alamat, setAlamat] = useState("")
    const [telepon, setTelepon] = useState("")
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
    
    const fetchSuppliers = useCallback(async () => {
        setIsLoadingList(true);
        const res = await fetch("/api/supplier");
        const data = await res.json();
        setSuppliers(data.data ?? []);
        setIsLoadingList(false)
    },[]);

    useEffect(() => {
        if(!user) return;

        let isMounted = true;

        async function getSuppliers() {
            setIsLoadingList(true);
            try{
                const res = await fetch("/api/supplier");
                const data = await res.json();
                if(isMounted){
                    setSuppliers(data.data ?? []);
                }
            }catch{
                console.error("Gagal mengambil data supplier");                
            }finally{
                if(isMounted){
                    setIsLoadingList(false);
                }
            }
        }

        getSuppliers();

        return () => {
            isMounted = false;
        };
    }, [user]);


    function openCreateForm(){
        setEditingId(null);
        setNamaSupplier("");
        setAlamat("");
        setTelepon("");
        setFormError(null);
        setIsFormOpen(true);
    }

    function openEditForm(supplier: Supplier){
        setEditingId(supplier.id);
        setNamaSupplier(supplier.namaSupplier);
        setAlamat(supplier.alamat);
        setTelepon(supplier.telepon);
        setFormError(null);
        setIsFormOpen(true);
    }

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        const isEdit = editingId !== null;
        const url = isEdit ? `/api/supplier/${editingId}` : "/api/supplier";
        const method = isEdit ? "PUT" : "POST";

        try{
            const res = await fetch(url, {
                method,
                headers : {"Content-type": "application/json"},
                body: JSON.stringify({namaSupplier, alamat, telepon})                
            });

            const data = await res.json();

            if(!res.ok){
                setFormError(data.error ?? "Gagal menyimpan supplier");
                return;
            }

            setIsFormOpen(false);
            await fetchSuppliers();            
        }catch{
            setFormError("Tidak dapat terhubung ke server");            
        }finally{
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if(!deleteTarget) return;

        const res = await fetch(`/api/supplier/${deleteTarget.id}`,{
            method: "DELETE",
        });

        if(res.ok){
            await fetchSuppliers();
        }
        setDeleteTarget(null);        
    }

    if(authLoading){
        return <div className="min-h-screen flex items-center justify-center bg-paper"><p>Memuat...</p></div>        
    }
    if(!user) return null;

    return (
        <div className="min-h-screen bg-paper p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl text-ink-text">Kelola Supplier</h1>
                <Button onClick={openCreateForm} className="bg-amber hover:bg-amber-hover text-white">
                    + Tambah Supplier
                </Button>
            </div>

            {isLoadingList ? (
                <p className="text-sage">Memuat data...</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Supplier</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Telepon</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell>{supplier.namaSupplier}</TableCell>
                                <TableCell>{supplier.alamat}</TableCell>
                                <TableCell>{supplier.telepon}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditForm(supplier)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-rust hover:text-rust"
                                        onClick={() => setDeleteTarget(supplier)}
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
                        <DialogTitle>{editingId ? "Edit Supplier" : "Tambah Supplier"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="text-sm text-rust border border-rust/30 bg-rust/5 rounded px-3 py-2">
                                {formError}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="namaCategory">Nama Supplier</Label>
                            <Input
                                id="namaCategory"
                                value={namaSupplier}
                                onChange={(e) => setNamaSupplier(e.target.value)}
                                autoFocus
                                required
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="alamt">Alamat</Label>
                            <Input
                                id="namaCategory"
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                                autoFocus
                                required
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="telepon">Telepon</Label>
                            <Input
                                id="namaCategory"
                                value={telepon}
                                onChange={(e) => setTelepon(e.target.value)}
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
                            Kategori &quot;{deleteTarget?.namaSupplier}&quot; akan dihapus permanen.
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
    )

}