import z from "zod";

export const purchaseItemShcema = z.object({
    productId: z
        .number({message: "productId harus berupa angka"})
        .int()
        .positive("productId tidak valid"),

    jumlah: z
        .number({message: "Jumlah harus berupa angka"})
        .int("Jumlah harus bilangan bulat")
        .positive("Jumlah harus lebih dari 0"),

    hargaPerUnit: z
        .number({message: "Harga per unit harus berupa angka"})
        .positive("Harga per unit harus lebih dari 0"),
    
    expiredDate : z
        .coerce.date({message: "Tanggal kadaluarsa tidak valid"})
        .refine((date)=> date > new Date(), {
            message: "Tanggal kadaluarsa harus di masa depan",
        }),
})

export const createPurchaseShcema = z.object({
    supplierId : z
        .number({message: "supplierId harus berupa angka"})
        .int()
        .positive("supplierId tidak valid"),
    
    items: z
        .array(purchaseItemShcema)
        .min(1, "Minimal harus ada 1 item pembelian")
})



export type CreatePurchaseInput = z.infer<typeof createPurchaseShcema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemShcema>;