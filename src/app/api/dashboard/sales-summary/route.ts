import { NextResponse } from "next/server";
import { DashboardService } from "@/services/dashboard.service";
import { handleApiError } from "@/utils/handleApiErrors";

export async function GET() {
    try{
        const data = await DashboardService.getSalesSummary();
        return NextResponse.json(
            {message : "Sales Summary", data},
            {status : 200}
        )
    }catch(error){
        return handleApiError(error)
    }
}