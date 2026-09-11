import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AppJWTPayload  extends JoseJWTPayload{
    userId: number;
    role: string;
}

export async function signToken(payload: AppJWTPayload ): Promise<string>{
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(secret);
}

export async function verifyToken(token: string): Promise<AppJWTPayload >{
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AppJWTPayload;
}