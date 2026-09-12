import { NextResponse } from "next/server";
import { CategoryService } from "@/services/category.service";
import { updateCategorySchema } from "@/validations/category.validation";
import { handleApiError } from "@/utils/handleApiErrors";
import { BadRequestError } from "@/errors/bad-request.error";
import { requiereRole } from "@/utils/auth";


export async function GET(request: Request, {params} : {params:Promise<{id: string}>}){
    try{
        const { id } = await params
        const categoryId = Number(id)

        if(isNaN(categoryId)){
            throw new BadRequestError("Id kategori tidak valid")
        }

        const category = await CategoryService.findId(categoryId)       

        return NextResponse.json(
            {"message": "kategori id berhasil di tampilkan", "data": category},
            {"status": 200}
        )
    }catch(error){
        return handleApiError(error)
    }
}

export async function PUT(request: Request, {params}: {params:Promise<{id: string}>}){
    try{
        
        requiereRole(request, ["ADMIN"]);

        let body : unknown;
        try{
            body = await request.json()
        }catch{
            throw new BadRequestError("Format JSON tidak valid")
        }

        const result = updateCategorySchema.safeParse(body)

        if(!result.success){
            const firstError = result.error.issues[0]
            throw new BadRequestError(firstError.message)
        }

        const { id } = await params
        const categoryId = Number(id)

        if(isNaN(categoryId)){
            throw new BadRequestError("Invalid Id Kategori");
        }

        const category = await CategoryService.update(categoryId, result.data)

        return NextResponse.json(
            {"message" : "kategori berhasil di update", "data" : category},
            {"status" : 200}
        )

    }catch(error){
        return handleApiError(error)
    }
}

export async function DELETE(request : Request, {params} : {params:Promise<{id: string}>}){
    try{

        requiereRole(request, ["ADMIN"]);

        const { id } = await params;
        const categoryId = Number(id);

        if(isNaN(categoryId)){
            throw new BadRequestError("id kategori tidak valid");
        }

        await CategoryService.delete(categoryId);
        return NextResponse.json(
            {"message" : "kategori berhasi dihapus"},
            {"status" : 200}
        )

    }catch(error){
        return handleApiError(error);
    }
}
