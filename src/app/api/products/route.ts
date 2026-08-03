import { Prisma } from "@/generated/prisma/client";
import {ProductService} from "@/services/product.service";
import { NextResponse } from "next/server";
import { handleApiError } from "@/utils/handleApiErrors";

export async function GET() {
    try{
        const products = await ProductService.findAll();
        console.log(products)
        return NextResponse.json(
            {
                "message" : "Get all Product",
                "data" : products
            },
            {status : 200}
        )
    }
    catch(error){
        const message =
        error instanceof Error
            ? error.message
            : "Internal Server Error";

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request){
    try{
        const body = await request.json() as Prisma.ProductCreateInput;
        const product = await ProductService.create(body);

        return NextResponse.json(
            {
                "message":"Product created successfully",
                data : product
            },
            {status : 201},
            );
        
    }catch(error){
        const message =
        error instanceof Error
            ? error.message
            : "Internal Server Error";

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}