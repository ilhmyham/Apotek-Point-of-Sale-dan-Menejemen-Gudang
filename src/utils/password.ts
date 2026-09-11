import bcrypt from "bcrypt";

const SALT_ROUND = 10;

export async function hasPassowrd(plainPassword: string):Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUND)
}

export async function comparePassword(plainPassword: string, hashedPassword: string):Promise<boolean>{
    return bcrypt.compare(plainPassword, hashedPassword)
}