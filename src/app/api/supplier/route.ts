import { BadRequestError } from "@/errors/bad-request.error";
import { SupplierService } from "@/services/supplier.service";
import { handleApiError } from "@/utils/handleApiErrors";
import { createSupplierSchema } from "@/validations/supplier.validation";
import { NextResponse } from "next/server";
import { requiereRole } from "@/utils/auth";

export async function GET(){
    try{
        const data = await SupplierService.findAll()
    
        return NextResponse.json(
            {"message" : "Get all Supplier", "data" : data},
            {"status" : 200}
        )
    }catch(error){
        return handleApiError(error)
    }

}

export async function POST(request: Request) {
    try{

        requiereRole(request, ["ADMIN"]);

        let body : unknown
        try{
            body = await request.json()
        }catch{
            throw new BadRequestError("Format JSON tidak valid")
        }

        const result = createSupplierSchema.safeParse(body)
        if(!result.success){
            const firstError = result.error.issues[0]
            throw new BadRequestError(firstError.message)
        }

        const supplier = await SupplierService.create(result.data)
        return NextResponse.json(
            {"message" : "Supplier berhasil dibuat", "data" : supplier},
            {"status": 201}
        )

    }catch(error){
        return handleApiError(error)
    }
}

