import { UserRepository } from "@/repositories/user.repository";
import {Prisma, User} from "@/generated/prisma/client";
import { hasPassowrd } from "@/utils/password";
import { RegisterUserInput } from "@/validations/user.validation"
import { BadRequestError } from "@/errors/bad-request.error";
import { comparePassword } from "@/utils/password";
import { signToken } from "@/utils/jwt";
import { LoginInput } from "@/validations/auth.validation";
import { NotFoundError } from "@/errors/not-found.error";

export type SafeUser = Omit<User, "password">

function toSafeUser(user: User): SafeUser{
    const {password, ...safeUser} = user
    return safeUser;
}

export const UserService = {
    async register(data: RegisterUserInput): Promise<SafeUser>{
        const existingUser = await UserRepository.findByUsername(data.username);
        if(existingUser){
            throw new BadRequestError("Username sudah digunakan");
        };

        const hashedPassword = await hasPassowrd(data.password);

        const create: Prisma.UserCreateInput = {
            username : data.username,
            password : hashedPassword,
            nama : data.nama,
            role : data.role ?? "USER",
        };

        const user = await UserRepository.create(create);

        return toSafeUser(user);
    },

    async login(data: LoginInput): Promise<{token: string, user:SafeUser}>{
        const user = await UserRepository.findByUsername(data.username);
        if(!user){
            throw new BadRequestError("Username atau password salah");
        }

        const isPasswordValid = await comparePassword(data.password, user.password);
        if(!isPasswordValid){
            throw new BadRequestError("Username atau password salah");
        }

        const token = await signToken({userId: user.id, role: user.role});

        return {token, user: toSafeUser(user)};
    },

    async getProfile(userId: number):Promise<SafeUser>{
        const user = await UserRepository.findById(userId);

        if(!user){
            throw new NotFoundError("User tidak ditemukan");
        }

        return toSafeUser(user)
    }
}
