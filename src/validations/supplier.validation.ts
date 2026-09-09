import z from "zod";

export const createSupplierSchema = z.object({
    namaSupplier: z
    .string({message : "nama harus berupa huruf"})
    .trim()
    .min(3, {message: "nama harus memiliki 3 karakter"}),

    alamat: z
    .string({message : "alamat wajib diisi"})
    .trim()
    .min(10, {message: "Alamat terlalu pendek, minimal 10 karakter"})
    .max(250, {message : "Alamat terlalu pnajang, maximal 250 katakter"})
})

export const updateSupplierSchema = z.object({
    namaSupplier: z
    .string({message : "nama harus berupa huruf"})
    .trim()
    .min(3, {message : "nama supplier harus memiliki 3 karakter"})
    .optional(),

    alamat: z
    .string({message : "alamat wajib diisi"})
    .trim()
    .min(10, {message: "Alamat terlalu pendek, miminal memiliki 10 karakter"})
    .max(250, {message: "Alamat terlalu panjang, maximal 250 katakter"})
    .optional()
})

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>