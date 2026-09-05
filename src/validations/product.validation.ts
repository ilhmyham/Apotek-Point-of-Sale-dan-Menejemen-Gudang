import { z } from "zod";

export const createProductSchema = z.object({
  namaProduct: z
    .string({ message: "Nama produk harus berupa teks" })
    .trim()
    .min(3, "Nama produk minimal 3 karakter"),

  harga: z
    .number({ message: "Harga harus berupa angka" })
    .positive("Harga harus lebih dari 0"),

  stok: z
    .number({ message: "Stok harus berupa angka" })
    .int("Stok harus bilangan bulat")
    .nonnegative("Stok tidak boleh negatif"),

  unit: z
    .string({ message: "Unit harus berupa teks" })
    .trim()
    .min(1, "Satuan produk wajib diisi"),

  categoryId: z
    .number({ message: "categoryId harus berupa angka" })
    .int()
    .positive("categoryId tidak valid"),

  supplierId: z
    .number({ message: "supplierId harus berupa angka" })
    .int()
    .positive("supplierId tidak valid"),

  status: z.boolean().optional().default(true),
})

export const updateProductSchema = z.object({
  namaProduct: z
    .string({message:"Nama produk harus berupa teks"})
    .trim()
    .min(3, "Nama produk minimal 3 karakter")
    .optional(),
  
  harga: z
    .number({ message: "Harga harus berupa angka" })
    .positive("Harga harus lebih dari 0")
    .optional(),

  stok: z
    .number({ message: "Stok harus berupa angka" })
    .int("Stok harus bilangan bulat")
    .nonnegative("Stok tidak boleh negatif")
    .optional(),

  unit: z
    .string({ message: "Unit harus berupa teks" })
    .trim()
    .min(1, "Satuan produk wajib diisi")
    .optional(),

  categoryId: z
    .number({ message: "categoryId harus berupa angka" })
    .int()
    .positive("categoryId tidak valid")
    .optional(),

  supplierId: z
    .number({ message: "supplierId harus berupa angka" })
    .int()
    .positive("supplierId tidak valid")
    .optional(),

  status: z.boolean().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;