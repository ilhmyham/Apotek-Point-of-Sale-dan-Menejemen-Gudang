import { ProductService } from "@/services/product.service";
import { NextResponse } from "next/server";
import { handleApiError } from "@/utils/handleApiErrors";
import { BadRequestError } from "@/errors/bad-request.error";
import { requireRole } from "@/utils/auth";


export async function PATCH(request: Request, {params}:{params:Promise<{id: string}>}){
    try{
        requireRole(request, ["ADMIN"]);
        const { id } = await params;
        const productId = Number(id)
        
        if(isNaN(productId)){
            throw new BadRequestError("id produk tidak valid");
        }

        const product = await ProductService.active(productId)

        return NextResponse.json(
            {message: "Produk berhasil diaktifkan", data: product},
            {status: 200},
        )

    }catch(error){
        return handleApiError(error);
    }
}
