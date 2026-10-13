'use client'
import { useState } from "react";
import { validatePassword } from '@/lib/auth';

export default function Landing() {

    const [emailInput, setEmailInput] = useState<string>("");
    const [passInput, setPassInput] = useState<string>("");

    async function handleLogin() {
        if (await validatePassword(emailInput, passInput)) {
            console.log("hey it passed")
        }
    }

    function handleSignUpRouting() {}

    return (
            <div className="w-fullmax-w-md p-8 bg-sky-400 backdrop-blur rounded-2xl shadow-2xl border border-slate-600 flex flex-col gap-6">
                
                <div className="flex flex-col gap-2">
                    <label htmlFor="email-input" className="text-sm font-medium text-slate-600">Email</label>
                    <input 
                        type="email" 
                        id="email-input" 
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" 
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={(change) => setEmailInput(change.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="password-input" className="text-sm font-medium text-slate-600">Password</label>
                    <input 
                        type="password" 
                        id="password-input" 
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" 
                        placeholder="••••••••"
                        value={passInput}
                        onChange={(change) => setPassInput(change.target.value)}
                    />
                </div>

                <div className="flex gap-4 pt-2">
                    <button 
                        className="flex-1 py-2.5 px-4 border-2 border-slate-500 rounded-lg font-medium hover:bg-slate-800 active:bg-slate-900 transition"
                        onClick={() => handleSignUpRouting()}
                    >
                        Sign Up
                    </button>

                    <button 
                        className="flex-1 py-2.5 px-4 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-800 active:bg-blue-900 transition"
                        onClick={() => handleLogin()}
                    >
                        Login
                    </button>
                </div>
                
            </div>
    )
}