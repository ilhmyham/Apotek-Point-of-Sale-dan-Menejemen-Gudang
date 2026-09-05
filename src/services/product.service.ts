import {ProductRepository} from "@/repositories/product.repository";
import {Prisma, Product} from "@/generated/prisma/client";
import { AppError } from "@/errors/AppError"
import { NotFoundError } from "@/errors/not-found.error";
import prisma from "@/lib/prisma";
import { CreateProductInput, UpdateProductInput } from "@/validations/product.validation";
import { BadRequestError } from "@/errors/bad-request.error";


export const ProductService = {

    async findAll() : Promise<Product[]>{
        return ProductRepository.findAll();
    },

    async findById(id : number) : Promise<Product | null> {
        const product = await ProductRepository.findById(id);
        if (!product){
            throw new NotFoundError();
        };
        return product;
    },

    async create(data: CreateProductInput) : Promise<Product>{
        const category = await prisma.category.findUnique({
            where: {id: data.categoryId}
        })
        if(!category){
            throw new BadRequestError("Kategori tidak ditemukan");
        }

        const supplier = await prisma.supplier.findUnique({
            where: {id: data.supplierId}
        })
        if(!supplier){
            throw new BadRequestError("Supplier tidak ditemukan");
        }

        const createData: Prisma.ProductCreateInput = {
            namaProduct : data.namaProduct,
            harga : data.harga,
            stok : data.stok,
            unit : data.unit,
            status : data.status,
            category : {connect: {id: data.categoryId}},
            supplier : {connect: {id: data.supplierId}}
        }
        return ProductRepository.create(createData)
    },

    async update(id : number, data : UpdateProductInput) : Promise<Product>{
        const product = await ProductRepository.findById(id);
        if(!product){
            throw new NotFoundError("Produk tidak ditemukan");
        }
        if(data.categoryId !== undefined){
            const category = await prisma.category.findUnique({
                where: {id: data.categoryId}
            })
    
            if(!category){
                throw new BadRequestError("Kategori tidak ditemukan");
            }
        }

        if(data.supplierId !== undefined){
            const supplierId = await prisma.supplier.findUnique({
                where:{id : data.supplierId}
            })
    
            if(!supplierId){
                throw new BadRequestError("Supplier tidak ditemukan");
            }
        }

        const updateData : Prisma.ProductUpdateInput = {
            namaProduct:data.namaProduct,
            harga: data.harga,
            stok : data.stok,
            unit : data.unit,
            status : data.status,
            ...(data.categoryId !== undefined && {
                category : {connect : {id : data.categoryId}}
            }),
            ...(data.supplierId !== undefined && {
                supplier : {connect : {id : data.supplierId}}
            })
        }

        return ProductRepository.update(id, updateData)
    },

    async delete(id : number) : Promise<void>{
        const product = await ProductRepository.findById(id);
        if(!product) {
            throw new NotFoundError("product not found");            
        }
        return ProductRepository.delete(id)
    },

    async search(keyword : string) : Promise<Product[]>{
        return ProductRepository.search(keyword)
    },

    async deactivate(id : number) : Promise<Product>{
        const product = await ProductRepository.findById(id);
        if(!product) {
            throw new NotFoundError("product not found");            
        }
        return ProductRepository.deactivate(id)
    }
}