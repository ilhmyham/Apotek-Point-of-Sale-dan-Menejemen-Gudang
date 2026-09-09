import prisma from "@/lib/prisma";
import {Prisma, Supplier } from "@/generated/prisma/client";


export const supplierRepository = {
    async findAll() : Promise<Supplier[]>{
        return await prisma.supplier.findMany();
    },

    async findId(id : number):Promise<Supplier|null>{
        return await prisma.supplier.findUnique({
            where : {id}
        })
    },

    async create(data : Prisma.SupplierCreateInput):Promise<Supplier>{
        return prisma.supplier.create({
            data
        });
    },

    async update(id:number, data: Prisma.SupplierUpdateInput):Promise<Supplier>{
        return prisma.supplier.update({
            where : {id},
            data
        })
    },

    async delete(id: number): Promise<void>{
        await prisma.supplier.delete({
            where:{id}
        })
    }
}
