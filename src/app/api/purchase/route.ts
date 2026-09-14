import { NextResponse } from "next/server";
import { PurchaseService } from "@/services/purchase.service";
import { createPurchaseShcema } from "@/validations/purchase.validation";
import { handleApiError } from "@/utils/handleApiErrors";
import { BadRequestError } from "@/errors/bad-request.error";
import { requireRole, getUserId } from "@/utils/auth";

export async function POST(request: Request) {
    try{
        requireRole(request, ["ADMIN"]);

        let body : unknown;
        try{
            body = await request.json();            
        }catch{
            throw new BadRequestError("Format JSON tidak valid");
        }

        const result = createPurchaseShcema.safeParse(body);

        if(!result.success){
            const firstError = result.error.issues[0];
            throw new BadRequestError(firstError.message);
        }

        const userId = getUserId(request);

        const purchase = await PurchaseService.create(result.data, userId);

        return NextResponse.json(
            {message : "Purchase berhasil dibuat", data : purchase},
            {status: 201}
        );
        
    }catch(error){
        return handleApiError(error);
    }
}