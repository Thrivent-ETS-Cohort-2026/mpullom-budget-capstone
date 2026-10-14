'use client';
import { useState } from "react";
import Login from "@/components/Login";
import ProfileEditor from "@/components/ProfileEditor";

export default function Landing() {
    const [isSigningUp, setIsSigningUp] = useState(false);

    return (
        <main className="h-screen w-screen flex flex-col justify-center items-center bg-slate-400 text-slate-600 p-4">
            <div className="w-full max-w-xl flex flex-col items-center">
                <h1 className="text-center text-5xl md:text-7xl font-bold mb-8 tracking-tight w-full">
                    {isSigningUp ? "Sign Up" : "Best Bud Jet"}
                </h1>
                
                {isSigningUp ? (
                    <ProfileEditor onSwitchToLogin={() => setIsSigningUp(false)} />
                ) : (
                    <Login onSwitchToSignup={() => setIsSigningUp(true)} />
                )}
            </div>
        </main>
    );
}