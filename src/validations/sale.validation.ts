import {z} from "zod" ;

const saleItemSchema = z.object({
    productId: z
        .number({message: "productId harus berupa angka"})
        .int()
        .positive("productId tidak valid"),

    jumlah: z
        .number({message: "Jumlah harus berupa angka"})
        .int("Jumlah harus bilangan bulat")
        .positive("Jumlah harus lebih dari 0")    
});

export const createSaleSchema = z.object({
    bayar: z
        .number({message: "Jumlah bayar harus berupa angka"})
        .positive("Jumlah bayar harus lebih daru 0"),
    
    items: z
        .array(saleItemSchema)
        .min(1, "Minimal harus ada 1 item penjualan"),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>
export type SaleItemInput = z.infer<typeof saleItemSchema>