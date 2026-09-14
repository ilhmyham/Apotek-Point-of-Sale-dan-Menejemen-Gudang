import { NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import { handleApiError } from "@/utils/handleApiErrors";
import { BadRequestError } from "@/errors/bad-request.error";
import { requireRole } from "@/utils/auth";

export async function PATCH(request : Request, {params}:{params:Promise<{id : string}>}){
    try{
        requireRole(request, ["ADMIN"]);

        const { id } = await params
        const produtId = Number(id)

        if(isNaN(produtId)){
            throw new BadRequestError("Id Produk tidak valid")        
        }

        const product = await ProductService.deactivate(produtId)

        return NextResponse.json(
            {message : "Produk berhasil dinonaktifkan", data: product},
            {status : 200}
        )
    }catch(error){
        return handleApiError(error)
    }
}