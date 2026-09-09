import prisma from "@/lib/prisma";
import { Prisma, Supplier } from "@/generated/prisma/client";
import { supplierRepository } from "@/repositories/supplier.repository"
import { NotFoundError } from "@/errors/not-found.error";
import { CreateSupplierInput, UpdateSupplierInput } from "@/validations/supplier.validation";
import { BadRequestError } from "@/errors/bad-request.error";


export const SupplierService = {
    async findAll():Promise<Supplier[]>{
        return await supplierRepository.findAll();
    },

    async findId(id: number):Promise<Supplier | null>{
        const supplier = await supplierRepository.findId(id);
        if(!supplier){
            throw new NotFoundError("Supplier tidak ditemukan")
        };

        return supplier;
    },

    async create(data: CreateSupplierInput):Promise<Supplier>{
        const craeteData : Prisma.SupplierCreateInput = {
            namaSupplier : data.namaSupplier,
            alamat : data.alamat,
            telepon : data.telepon
        }

        return supplierRepository.create(craeteData)
    },

    async update(id: number, data: UpdateSupplierInput):Promise<Supplier>{
        const supplier = await supplierRepository.findId(id)
        if(!supplier){
            throw new NotFoundError("Supplier tidak ditemukan");
        }

        const updateData : Prisma.SupplierUpdateInput = {
            namaSupplier : data.namaSupplier,
            alamat : data.alamat,
            telepon : data.telepon
        }

        return supplierRepository.update(id, updateData)
    },

    async delete(id: number): Promise<void>{
        const supplier = await supplierRepository.findId(id)
        if(!supplier){
            throw new NotFoundError("Supplier tidak ditemukan")
        }

        const hasProduct = await prisma.product.findFirst({
            where : {supplierId : id}
        })

        if(hasProduct){
            throw new BadRequestError("tidak dapat menghapus supplier, karena masih digunakan")
        }

        await supplierRepository.delete(id);
    }   
}