import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";

export function handleApiError (error : unknown){
    if(error instanceof AppError){
        return NextResponse.json(
            {error : error.message},
            {status : error.statusCode}
        )
    }

    if(error instanceof Error){
        return NextResponse.json(
            {error : error.message},
            {status : 500}
        )
    }

    return NextResponse.json(
        {error : "internal server error"},
        {status : 500}
    )
}