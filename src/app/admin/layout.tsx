// /app/admin/layout.tsx
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import React, { useState } from "react";
import Header from "../components/admin/Header";
import OrphanedVideoUploadBanner from "../components/admin/OrphanedVideoUploadBanner";
import Sidebar from "../components/admin/Sidebar";
import VideoUploadPill from "../components/admin/VideoUploadPill";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    return (
        <div className="flex bg-[#F4F5FA] min-h-screen w-full lg:gap-x-0">
            <AuthProvider>
                <ProtectedRoute>
                    {/* Mobile sidebar overlay */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <div className={`
                        fixed inset-y-0 left-0 z-50 w-[240px] bg-white transform transition-transform duration-300 ease-in-out
                        lg:relative lg:translate-x-0
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <Sidebar onClose={() => setSidebarOpen(false)} />
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col w-full lg:ml-0 overflow-hidden">
                        <Header onMenuClick={() => setSidebarOpen(true)} />
                        <main className="min-h-screen pt-6 px-5">{children}</main>
                    </div>

                    {/* Survive navigation between admin pages — the upload itself
                        lives in a module-level store, not this layout's lifecycle. */}
                    <VideoUploadPill />
                    <OrphanedVideoUploadBanner />
                </ProtectedRoute>
            </AuthProvider>
        </div>
    );
}