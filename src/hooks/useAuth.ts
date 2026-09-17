// src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
    id: number;
    username: string;
    nama: string;
    role: "USER" | "ADMIN";
}

export function useAuth(requiredRole?: "ADMIN") {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchProfile() {
            try {
                const res = await fetch("/api/auth/me");
                if (!res.ok) {
                    router.push("/login");
                    return;
                }

                const data = await res.json();

                if (requiredRole && data.data.role !== requiredRole) {
                    router.push("/dashboard");
                    return;
                }

                if (isMounted) setUser(data.data);
            } catch {
                router.push("/login");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [router, requiredRole]);

    return { user, isLoading };
}