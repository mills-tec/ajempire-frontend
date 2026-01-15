// /app/admin/layout.tsx
import React from "react";

export const metadata = {
    title: "Admin Panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-100">
                {/* Optional: You can add an Admin Navbar here */}
                <main className="min-h-screen">{children}</main>
            </body>
        </html>
    );
}