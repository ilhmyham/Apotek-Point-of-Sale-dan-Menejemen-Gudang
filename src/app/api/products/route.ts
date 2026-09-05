import { NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import { handleApiError } from "@/utils/handleApiErrors";
import { createProductSchema } from "@/validations/product.validation";
import { BadRequestError } from "@/errors/bad-request.error";

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
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestError("Format JSON tidak valid");
    }

    const result = createProductSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      throw new BadRequestError(firstError.message);
    }

    const product = await ProductService.create(result.data);

    return NextResponse.json(
      { message: "Product created successfully", data: product },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}