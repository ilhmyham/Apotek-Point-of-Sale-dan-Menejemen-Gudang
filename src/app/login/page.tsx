// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        const initial = setTimeout(() => setNow(new Date()), 0);
        const timer = setInterval(() => setNow(new Date()), 1000);

        return () => {
            clearTimeout(initial);
            clearInterval(timer);
        };
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Login gagal");
                return;
            }

            router.push("/dashboard"); // sesuaikan dengan route dashboard kamu nanti
        } catch {
            setError("Tidak dapat terhubung ke server");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-ink">
            {/* Panel kiri: identitas + ledger */}
            <div className="relative md:w-[42%] px-8 py-10 md:py-16 flex flex-col justify-between overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--color-sage) 27px, var(--color-sage) 28px)",
                    }}
                />
                <div className="relative">
                    <h1 className="font-display text-3xl md:text-4xl text-paper tracking-tight">
                        Apotek D
                    </h1>
                    <p className="font-display italic text-sage mt-2 text-lg">
                        Kelola apotek dengan tepat
                    </p>
                </div>

                <div className="relative hidden md:block text-sage">
                    <p className="text-sm">
                        {now?.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                    <p className="text-2xl font-display text-paper mt-1">
                        {now?.toLocaleTimeString("id-ID")}
                    </p>
                </div>
            </div>

            {/* Panel kanan: form */}
            <div className="flex-1 bg-paper flex items-center justify-center px-6 py-12">
                <form onSubmit={handleSubmit} className="w-full max-w-sm">
                    <h2 className="font-display text-2xl text-ink-text mb-1">Masuk</h2>
                    <p className="text-sage text-sm mb-8">
                        Gunakan akun yang diberikan admin apotek
                    </p>

                    {error && (
                        <div className="mb-5 text-sm text-rust border border-rust/30 bg-rust/5 rounded px-3 py-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="username" className="text-ink-text">
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                                required
                                className="mt-1.5 bg-white border-ink-text/15"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-ink-text">
                                Password
                            </Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white border-ink-text/15 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage hover:text-ink-text"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-7 bg-amber hover:bg-amber-hover text-white"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            "Masuk"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}