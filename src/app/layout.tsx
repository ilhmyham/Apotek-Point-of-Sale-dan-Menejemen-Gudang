// src/app/layout.tsx
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-display",
    weight: ["400", "500", "600"],
});

const plexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    variable: "--font-ui",
    weight: ["400", "500", "600"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body className={`${fraunces.variable} ${plexSans.variable} font-ui`}>
                {children}
            </body>
        </html>
    );
}