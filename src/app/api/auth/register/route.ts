import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";
import { handleApiError } from "@/utils/handleApiErrors";
import { registerUserSchema } from "@/validations/user.validation";
import { BadRequestError } from "@/errors/bad-request.error";

export async function POST(request : Request) {
    try{
        let body : unknown;
        try{
            body = await request.json();
        }catch{
            throw new BadRequestError("Format JSON tidak valid");
        };

        const result = registerUserSchema.safeParse(body)
        if(!result.success){
            const firstError = result.error.issues[0]
            throw new BadRequestError(firstError.message)
        };

        const register = await UserService.register(result.data);
        
        return NextResponse.json(
            {"message" : "Akun anda berhasil terdaftar", "data" : register},
            {"status"  : 201}
        )

    }catch(error){
        return handleApiError(error);
    }
}