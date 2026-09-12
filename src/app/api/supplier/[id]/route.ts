import { BadRequestError } from "@/errors/bad-request.error"
import { SupplierService } from "@/services/supplier.service"
import { handleApiError } from "@/utils/handleApiErrors"
import { updateSupplierSchema } from "@/validations/supplier.validation"
import { NextResponse } from "next/server"
import { requiereRole } from "@/utils/auth"

export async function GET(request : Request, {params} : {params:Promise<{id: string}>}){
    try{

        const { id } = await params
        const supplierId = Number(id)
    
        if(isNaN(supplierId)){
            throw new BadRequestError("Id supplier tidak valid");
        }
    
        const data = await SupplierService.findId(supplierId)
        return NextResponse.json(
            {"message" : "Get findId Supplier", "data" : data},
            {"status" : 200}
        )
    }catch(error){
        return handleApiError(error);
    }

}

export async function PUT(request: Request, {params} : {params:Promise<{id: string}>}) {
    try{

        requiereRole(request, ["ADMIN"]);

        let body : unknown
        try{
            body = await request.json();
        }catch{
            throw new BadRequestError("Format JSON tidak valid");
        }

        const result = updateSupplierSchema.safeParse(body);
        if(!result.success){
            const firstError = result.error.issues[0]
            throw new BadRequestError(firstError.message)
        }

        const { id } = await params
        const supplierId = Number(id)

        if(isNaN(supplierId)){
            throw new BadRequestError("Id supplier tidak valid");
        }

        const supplier = await SupplierService.update(supplierId, result.data)
        return NextResponse.json(
            {"message" : "Supplier berhasil diupdate", "data" : supplier},
            {"status" : 200}
        )
        
    }catch(error){
        return handleApiError(error)
    };
}

export async function DELETE(request :  Request, {params} : {params:Promise<{id: string}>}) {
    try{

        requiereRole(request, ["ADMIN"]);

        const { id } = await params
        const supplierId = Number(id)

        if(isNaN(supplierId)){
            throw new BadRequestError("Id supplier tidak valid")
        }      

        await SupplierService.delete(supplierId)

        return NextResponse.json(
            {"message" : "supplier berhasil dihapus"},
            {"status" : 200}
        )

    }catch(error){
        return handleApiError(error)
    }
}