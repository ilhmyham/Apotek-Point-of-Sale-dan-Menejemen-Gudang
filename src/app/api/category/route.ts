import { NextResponse } from "next/server";
import { CategoryService } from "@/services/category.service";
import { createCategorySchema } from "@/validations/category.validation";
import { handleApiError } from "@/utils/handleApiErrors";
import { BadRequestError } from "@/errors/bad-request.error";
import { requiereRole } from "@/utils/auth";

export async function GET(){
   try{
        const categories = await CategoryService.findAll()
        return NextResponse.json(
            {"message": "Get all data category", "data" : categories},
            {"status" : 200}
        )
   }catch(error){
     return handleApiError(error);
   }
} 

export async function POST(request: Request){
    try{

        requiereRole(request, ["ADMIN"]);

        let body : unknown
        try{
            body = await request.json()
        }catch{
            throw new BadRequestError("Format JSON tidak valid")
        }

        const result = createCategorySchema.safeParse(body)

        if(!result.success){
            const firstError = result.error.issues[0]
            throw new BadRequestError(firstError.message)
        }

        const category = await CategoryService.create(result.data)
        return NextResponse.json(
            {"message" : "kategori berhasil ditambahkan", "data" : category},
            {"status" : 201}
        )
    }catch(error){
        return handleApiError(error)
    }
}