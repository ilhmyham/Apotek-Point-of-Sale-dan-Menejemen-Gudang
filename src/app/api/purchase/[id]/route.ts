import { NextResponse } from "next/server";
import { PurchaseService } from "@/services/purchase.service";
import { handleApiError } from "@/utils/handleApiErrors";
import { BadRequestError } from "@/errors/bad-request.error";


export async function GET(request: Request, {params} : {params:Promise<{id: string}>}){
    try{
        const { id } = await params;
        const purchaseId = Number(id);
    
        if(isNaN(purchaseId)){
            throw new BadRequestError("Id purchase tidak valid");
        }
    
        const purchase = await PurchaseService.findById(purchaseId);
    
        return NextResponse.json(
            {message : "Get purchase by id", data: purchase},
            {status : 200}
        )
    }catch(error){
        return handleApiError(error)
    }
}