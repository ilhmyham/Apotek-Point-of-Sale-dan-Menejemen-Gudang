import z from "zod";

export const loginSchema = z.object({
    username: z.string({message:"Username wajib diisi"}).trim().min(1),
    password : z.string({message: "Password wajib diisi"}).min(1)
});

export type LoginInput = z.infer<typeof loginSchema>;