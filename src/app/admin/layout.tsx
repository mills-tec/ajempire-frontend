// /app/admin/layout.tsx
"use client";
import React, { useState } from "react";
import Header from "../components/admin/Header";
import Sidebar from "../components/admin/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
       
            <div className="w-full lg:flex lg:gap-3  lg:justify-between">
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
                        <div className="flex flex-col lg:pt-4 w-full lg:w-[80%] lg:ml-0">
                            <Header onMenuClick={() => setSidebarOpen(true)} />
                            <main className=" pt-6">{children}</main>
                        </div>
                    </ProtectedRoute>
                </AuthProvider>
            </div>
        
    );
}