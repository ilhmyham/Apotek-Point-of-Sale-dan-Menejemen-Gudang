import {ProductRepository} from "@/repositories/product.repository";
import {Prisma, Product} from "@/generated/prisma/client";


export const ProductService = {

    async findAll() : Promise<Product[]>{
        return ProductRepository.findAll();
    },

    async findById(id : number) : Promise<Product | null> {
        const product = await ProductRepository.findById(id);
        if (!product){
            throw new Error("Product not found");
        };
        return product;
    },

    async create(data: Prisma.ProductCreateInput) : Promise<Product>{
        if (!data.namaProduct.trim()) {
            throw new Error("Nama produk wajib diisi.");
        }

        if (data.namaProduct.trim().length < 3) {
            throw new Error("Nama produk minimal 3 karakter.");
        }

        if (Number(data.harga) <= 0) {
            throw new Error("Harga harus lebih dari 0.");
        }

        if (data.stok < 0) {
            throw new Error("Stok tidak boleh negatif.");
        }

        if (!data.unit.trim()) {
            throw new Error("Satuan produk wajib diisi.");
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