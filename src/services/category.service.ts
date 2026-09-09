import { CategoryRepository } from "@/repositories/category.repository";
import prisma from "@/lib/prisma";
import {Prisma, Category} from "@/generated/prisma/client"
import {CreateCategoryInput, UpdateCategoryInput} from "@/validations/category.validation"
import { NotFoundError } from "@/errors/not-found.error";
import { BadRequestError } from "@/errors/bad-request.error";


export const CategoryService = {
    async findAll() : Promise<Category[]>{
        return CategoryRepository.findAll();
    },

    async findId(id : number) : Promise<Category | null>{
        const category = await CategoryRepository.findById(id)
        if(!category){  
            throw new NotFoundError("kategori tidak ditemukan");
        };
        return category;
    },

    async create(data: CreateCategoryInput):Promise<Category>{
        const createData : Prisma.CategoryCreateInput = {
            namaCategory : data.namaCategory
        };

        return CategoryRepository.create(createData);
    },

    async update(id : number, data : UpdateCategoryInput):Promise<Category>{
        const category = await CategoryRepository.findById(id);
        if(!category){
            throw new NotFoundError("Kategori tidak ditemukan");
        };

        const updateData : Prisma.CategoryUpdateInput = {
            namaCategory : data.namaCategory
        };

        return CategoryRepository.update(id, updateData);
    },

    async delete(id: number) : Promise<void>{
        const category = await CategoryRepository.findById(id);

        if(!category){
            throw new NotFoundError("Kategori tidak ditemukan");
        };

        const hasProduct = await prisma.product.findFirst({
            where : {categoryId : id}
        });

        if(hasProduct){
            throw new BadRequestError("Tidak dapat menghapus kategori, karena masih digunakan")
        };

        return CategoryRepository.delete(id);
    }
}