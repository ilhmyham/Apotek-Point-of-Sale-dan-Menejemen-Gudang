import prisma from "@/lib/prisma"
import { Prisma, Category } from "@/generated/prisma/client"

export const CategoryRepository = {
    async findAll():Promise<Category[]>{
        return prisma.category.findMany()
    },

    async findById(id: number): Promise<Category | null>{
        return prisma.category.findUnique({
            where: {id}
        })
    },

    async create(data: Prisma.CategoryCreateInput): Promise<Category>{
        return prisma.category.create({
            data
        })
    },

    async update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category>{
        return prisma.category.update({
            where: {id},
            data
        })
    },

    async delete(id: number):Promise<void>{
        await prisma.category.delete({
            where: {id}
        })
    }
}