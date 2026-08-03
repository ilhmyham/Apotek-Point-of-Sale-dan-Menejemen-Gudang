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
        return NextResponse.json(
            {
                "message" : "Product get Successfully",
                "data" : product
            },
            {status : 201}
        );
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

export async function PUT(request : Request, {params} : {params:Promise<{id:string}>}){    

    const id = await params;
    const productId = Number(id);

     if(isNaN(productId)){
        return NextResponse.json(
            { error: "Invalid product id" },
            { status: 400 }
        )
    }

    try{
        const body = await request.json()
        const product = await ProductService.update(productId, body)
    

        if(isNaN(productId)){
            return NextResponse.json(
                {"message" : "product not found"},
                {status : 404}
            )
        }

        return NextResponse.json(
            {data : product},
            {status : 202}
        );
    }catch(error){
        const message = error instanceof Error ? error.message : "product Not Found";
        return NextResponse.json(
            {error : message},
            {status : 404}
        );
    }

}