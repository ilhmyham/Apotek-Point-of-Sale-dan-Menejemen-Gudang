import { UserRepository } from "@/repositories/user.repository";
import {Prisma, User} from "@/generated/prisma/client";
import { hasPassowrd } from "@/utils/password";
import { RegisterUserInput } from "@/validations/user.validation"
import { BadRequestError } from "@/errors/bad-request.error";

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
    }
}