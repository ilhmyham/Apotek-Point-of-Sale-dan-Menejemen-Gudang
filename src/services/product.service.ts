import {ProductRepository} from "@/repositories/product.repository";
import {Prisma, Product} from "@/generated/prisma/client";
import { AppError } from "@/errors/AppError"


export const ProductService = {

    async findAll() : Promise<Product[]>{
        return ProductRepository.findAll();
    },

    async findById(id : number) : Promise<Product | null> {
        const product = await ProductRepository.findById(id);
        if (!product){
            throw new AppError("Product not found");
        };
        return product;
    },

    async create(data: Prisma.ProductCreateInput) : Promise<Product>{

        if(typeof data.namaProduct !== "string"){
            throw new AppError ("Nama produk harus berupa string");
        }

        if (!data.namaProduct?.trim()) {
            throw new AppError ("Nama produk wajib diisi.");
        }

        if (data.namaProduct.trim().length < 3) {
            throw new AppError ("Nama produk minimal 3 karakter.");
        }       

        if (data.harga === undefined || data.harga === null) {
            throw new AppError ("Harga wajib diisi.");
        }   
        
        if(typeof data.harga !== "number"){
            throw new AppError ("Harga harus berupa number");
        }

        if (Number(data.harga) <= 0) {
            throw new AppError ("Harga harus lebih dari 0.");
        }

        if (data.stok === undefined || data.stok === null) {
            throw new AppError ("Stok wajib diisi.");
        }
        
        if (!Number.isInteger(data.stok)){
            throw new AppError ("stok harus berupa number");
        }

        if (data.stok < 0) {
            throw new AppError ("Stok tidak boleh negatif.");
        }

        if (data.unit === undefined || data.unit === null) {
            throw new AppError ("Unit wajib diisi.");
        }  

        if(typeof data.unit !== 'string'){
            throw new AppError ("Unit harus berupa string");
        }

        if (!data.unit?.trim()) {
            throw new AppError ("Satuan produk wajib diisi.");
        }

        return ProductRepository.create(data);
    },

    async update(id : number, data : Prisma.ProductUpdateInput) : Promise<Product>{
       const product = await ProductRepository.findById(id)
       if(!product) {
        throw new Error("product not found");    
       }

       return ProductRepository.update(id, data);
    },

    async delete(id : number) : Promise<void>{
        const product = await ProductRepository.findById(id);
        if(!product) {
            throw new Error("product not found");            
        }
        return ProductRepository.delete(id)
    },

    async search(keyword : string) : Promise<Product[]>{
        return ProductRepository.search(keyword)
    },

    async deactivate(id : number) : Promise<Product>{
        const product = await ProductRepository.findById(id);
        if(!product) {
            throw new Error("product not found");            
        }
        return ProductRepository.deactivate(id)
    }
}