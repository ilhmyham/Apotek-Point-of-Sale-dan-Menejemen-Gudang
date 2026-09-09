import { z } from "zod";

export const createCategorySchema = z.object({
    namaCategory: z
    .string({message: "nama Produk harus berupa teks"})
    .trim()
    .min(3, {message: "nama kategori minimal memiliki 3 karakter"}),
})

export const updateCategorySchema = z.object({
    namaCategory: z
    .string({message: "nama produk harus berupa teks"})
    .trim()
    .min(3, {message: "nama kategori minimal memiliki 3 karakter"})
    .optional()
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>  