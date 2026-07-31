import { ProductService } from "@/services/product.service";
import { NextResponse } from "next/server";

export async function GET(request : Request, {params} : {params:Promise<{id:string}>}) {

    const { id } = await params;
    const productId = Number(id);

    if(isNaN(productId)){
        return NextResponse.json(
            { error: "Invalid product id" },
        { status: 400 }
        )
    }

    try{
        const product = await ProductService.findById(productId);
        return NextResponse.json(product);
    }catch(error){
        const message =
        error instanceof Error
            ? error.message
            : "Product Not Found";

        return NextResponse.json(
            { error: message },
            { status: 404 }
        );
    }
}

