import prisma from "@/lib/prisma"
import {Prisma, User} from "@/generated/prisma/client"

export const UserRepository = {
    async findByUsername(username : string): Promise<User | null>{
        return prisma.user.findUnique({
            where : {username}
        });
    },

    async findById(id : number):Promise<User | null>{
        return prisma.user.findUnique({
            where : {id}
        });
    },

    async create(data: Prisma.UserCreateInput):Promise<User>{
        return prisma.user.create({
            data
        });
    }
}