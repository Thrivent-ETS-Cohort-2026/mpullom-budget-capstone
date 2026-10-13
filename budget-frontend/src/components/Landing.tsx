'use client'
import Login from "@/components/Login";

export default function Landing() {
    return (
        <main className="h-screen w-screen flex flex-col justify-center items-center bg-slate-400 text-slate-600 p-4">
            <div>
                <h1 className="text-center text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                    Best Bud Jet
                </h1>

                <Login />
            </div>
        </main>
    );
}