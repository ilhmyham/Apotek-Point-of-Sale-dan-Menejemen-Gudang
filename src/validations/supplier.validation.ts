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
    .max(250, {message : "Alamat terlalu pnajang, maximal 250 katakter"}),

    telepon : z
    .string({message : "Nomor telepon wajib diisi"})
    .trim()
    .transform((val) => val.replace(/[\s\-\(\)]/g, ""))
    .refine((val) => /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(val), {
    message: "Format nomor telepon tidak valid (contoh: 08123456789 atau +628123456789)"})  
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
    .optional(),

    telepon : z
    .string({message : "Nomor telepon wajib diisi"})
    .trim()
    .transform((val) => val.replace(/[\s\-\(\)]/g, ""))
    .refine((val) => /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(val), {
    message: "Format nomor telepon tidak valid (contoh: 08123456789 atau +628123456789)"})
    .optional()
})

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>