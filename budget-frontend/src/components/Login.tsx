'use client'
import {useState } from "react";
import { validatePassword } from '@/lib/auth';

export default function Landing() {

    const [emailInput, setEmailInput] = useState<string>("");
    const [passInput, setPassInput] = useState<string>("");

    // Login
    async function handleLogin() {
        if(await validatePassword(emailInput, passInput)){
            console.log("hey it passed")
        }
    }

    function handleSignUpRouting(){}


    return (
        <div className="h-screen flex flex-col justify-center items-center bg-slate-800 text-slate-50">

            <h1 className="w-3xl text-center text-7xl mb-10">
                Caland Arrr
            </h1>

            <div className="w-3xl border p-5 bg-slate-700">
                <div>
                    <label htmlFor="email-input" className="w-1/2 text-right">Email: </label>
                    <input type="email" id="email-input" className="w-1/2 border rounded" 
                        value={emailInput}
                        onChange={(change) => setEmailInput(change.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="password-input" className="w-1/2 text-right" >Password: </label>
                    <input type="password" id="password-input" className="w-1/2 border rounded" 
                        value={passInput}
                        onChange={(change) => setPassInput(change.target.value)}
                    />
                </div>

                <div className="flex flex-row">
                    <button className="border rounded hover:bg-slate-600 active:bg-slate-500"
                        onClick={() => handleSignUpRouting()}>
                        Sign Up
                    </button>

                    <button className="border rounded hover:bg-slate-600 active:bg-slate-500"
                        onClick={() => handleLogin()}>
                        Login
                    </button>
                </div>
                
            </div>
        </div>
    )
}