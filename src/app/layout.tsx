import type {Metadata} from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {title: "FGV Revival"};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="sv" suppressHydrationWarning>
        <body className="antialiased">{children}</body>
        </html>
    );
}
