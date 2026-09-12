import { ForbiddenError } from "@/errors/forbidden.error";

export function requiereRole(request: Request, allowedRoles : string[]){
    const role = request.headers.get("x-user-role");

    if(!role || !allowedRoles.includes(role)){
        throw new ForbiddenError();
    }
}

export function getUserId(request: Request): number{
    const userId = request.headers.get("x-user-Id")
    return Number(userId);
}