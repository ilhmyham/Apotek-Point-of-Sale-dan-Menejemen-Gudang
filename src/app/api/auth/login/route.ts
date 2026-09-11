import { UserService } from "@/services/user.service";
import { NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth.validation";
import { handleApiError } from "@/utils/handleApiErrors";
import { BadRequestError } from "@/errors/bad-request.error";


export async function POST(request: Request){
    try{
        let body : unknown;
        try{
            body = await request.json();
        }catch{
            throw new BadRequestError("Format JSON tidak valid");
        };

        const result = loginSchema.safeParse(body);
        if(!result.success){
            const firstError = result.error.issues[0];
            throw new BadRequestError(firstError.message);
        };

        const { token, user } = await UserService.login(result.data);

        const response = NextResponse.json(
            {messsage : "login berhasi", data: user},
            {status: 200}
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite : "strict",
            maxAge : 60*60*8,
            path: "/"
        });

        return response

    }catch(error){
        return handleApiError(error);
    }
}