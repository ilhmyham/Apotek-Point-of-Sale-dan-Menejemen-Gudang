import { NextResponse } from "next/server";
import { SaleService } from "@/services/sale.service";
import { BadRequestError } from "@/errors/bad-request.error";
import { handleApiError } from "@/utils/handleApiErrors";

export async function GET(request: Request, {params}: {params:Promise<{id : string}>}){
    try{
        const { id } = await params;
        const saleId = Number(id);

        if(isNaN(saleId)){
            throw new BadRequestError("Id penjualan tidak valid");            
        };

        const sale = await SaleService.findById(saleId);

        return NextResponse.json(
            {message : "Get By Id Sale", data: sale},
            {status: 200}
        );

    }catch(error){
        return handleApiError(error);
    }
}