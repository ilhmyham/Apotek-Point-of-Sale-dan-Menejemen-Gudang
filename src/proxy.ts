import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./utils/jwt";


const PUBLIC_PATHS = ["/api/auth/login", "/api/auth/register"];

export async function proxy(request : NextRequest){
    const { pathname } = request.nextUrl;

    // url tanpa cek middleware untuk dapat mengakses login dan register
    if(PUBLIC_PATHS.includes(pathname)){
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;

    if(!token){
        return NextResponse.json(
            {error : "Unauthorized, silahkan login terlebih dahulu"},
            {status : 401}
        );
    }

    try{
        const payload = await verifyToken(token);

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", String(payload.userId));
        requestHeaders.set("x-user-role", payload.role)

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }catch{
        return NextResponse.json(
            {error : "Token tidak valid atau sudah kadaluarsa"},
            {status: 401}
        )
    }
}

export const config = {
    matcher: "/api/:path*"
}