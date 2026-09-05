import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { ProductService } from "@/services/product.service";
import { handleApiError } from "@/utils/handleApiErrors";
import { updateProductSchema } from "@/validations/product.validation";
import { error } from "console";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";


export async function GET(request : Request, {params} : {params:Promise<{id:string}>}) {
    try{
        const { id } = await params;
        const productId = Number(id);

        if(isNaN(productId)){
           throw new BadRequestError("Invalid product id")
        }
        
        const product = await ProductService.findById(productId);
        return NextResponse.json(
            {
                "message" : "Product get Successfully",
                "data" : product
            },
            {status : 200}
        );
    }catch(error){
        return handleApiError(error)
    }
}

export async function PUT(request : Request, {params} : {params:Promise<{id:string}>}){    

    try{
        let body: unknown;
        try{
            body =  await request.json();
        }catch{
            throw new BadRequestError("Format JSON tidak valid")
        }

        const { id } = await params;
        const productId = Number(id);

        if (isNaN(productId)) {
            throw new BadRequestError("Invalid product id");
        }   

        const result = updateProductSchema.safeParse(body)

        if(!result.success){
            const firstError = result.error.issues[0];
            throw new BadRequestError(firstError.message)
        }

        const product = await ProductService.update(productId, result.data)

        return NextResponse.json(
            {message : "Product updated successfully", data: product},
            {status : 200}
        )

    }catch(error) {
        return handleApiError(error)
    }

}

export async function DELETE(request : Request, {params} : {params:Promise<{id:string}>}){
    try{
        const {id} = await params;
        const productId = Number(id);

        if(isNaN(productId)){
            throw new BadRequestError("Invalid product Id")
        }

        await ProductService.delete(productId)

        return NextResponse.json(
            {message : "produk berhasil dihapus"},
            {status : 200}
        )
    } catch(error){
        return handleApiError(error)
    }
}