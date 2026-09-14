import { NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import { BadRequestError } from "@/errors/bad-request.error";
import { handleApiError } from "@/utils/handleApiErrors";

export async function GET(request: Request) {
    try{
        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get("q");

        if(!keyword || keyword.trim() === ""){
            throw new BadRequestError("kata kunci pencarian wajib diisi")
        }

        const product = await ProductService.search(keyword)

        return NextResponse.json(
            {message: "hasil pencarian produk", data: product},
            {status : 200}
        )

    }catch(error){
        return handleApiError(error)
    }
}