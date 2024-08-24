"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user !== null) {
                router.push('/chat');
            } else {
                router.push('/login-signup');
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen bg-brown-900 text-[#e0d0b8]">Loading...</div>;
    }

    return <>{children}</>;
};