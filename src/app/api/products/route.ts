import {ProductService} from "@/services/product.service";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const products = await ProductService.findAll();
        return NextResponse.json(products)
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
        const body = await request.json();
        const product = await ProductService.create(body);

        return NextResponse.json(product,
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