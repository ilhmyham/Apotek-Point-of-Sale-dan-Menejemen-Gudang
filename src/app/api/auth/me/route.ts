import { NextApiResponse } from "next";
import { UserService } from "@/services/user.service";
import { handleApiError } from "@/utils/handleApiErrors";
import { getUserId } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try{

        const userId = getUserId(request);
        const user = await UserService.getProfile(userId);

        return NextResponse.json(
            {message : "Get profile berhasil", data: user},
            {status: 200}
        )

    }catch(error){
        return handleApiError(error)
    }
}