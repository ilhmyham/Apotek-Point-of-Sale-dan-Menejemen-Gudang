import { BadRequestError } from "@/errors/bad-request.error";
import { SaleService } from "@/services/sale.service";
import { getUserId } from "@/utils/auth";
import { handleApiError } from "@/utils/handleApiErrors";
import { createSaleSchema } from "@/validations/sale.validation";
import { NextResponse } from "next/server";


export async function GET(){
    try{
        const sale = await SaleService.findAll();
        
        return NextResponse.json(
            {message: "Get all Sale", data: sale},
            {status : 200}
        )
    }catch(error){
        return handleApiError(error)
    }
}

export async function POST(request: Request){
    try{
        let body : unknown
        try{
            body = await request.json();
        }catch{
            throw new BadRequestError("Format JSON tidak valid");
        }

        const result = createSaleSchema.safeParse(body)
        if(!result.success){
            const firstError = result.error.issues[0];
            throw new BadRequestError(firstError.message);
        }

        const userId = getUserId(request);

        const sale = await SaleService.create(result.data, userId)

        return NextResponse.json(
            {message:"Penjualan berhasil dibuat", data: sale},
            {status: 201}
        )
    }catch(error){
        return handleApiError(error)
    }
}