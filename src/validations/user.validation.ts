import z from "zod";

export const registerUserSchema = z.object({
    username : z
    .string({message: "username harus diisi dan berupa teks"})
    .trim()
    .min(3, "username minimal 3 karakter")
    .max(50, "username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "username hanya boleh huruf, angka, dan underscore"),

    password : z
    .string({message: "password harus diisi dan berupa teks"})
    .min(6, "password minimal 6 karakter"),

    nama: z
    .string({message: "nama harus diisi dan berupa teks"})
    .trim()
    .min(3, "nama minimal 3 karakter"),

    role : z
    .enum(["USER", "ADMIN"], {message: "Role harus USER atau ADMIN"})
    .optional()

})

export type RegisterUserInput = z.infer<typeof registerUserSchema>;