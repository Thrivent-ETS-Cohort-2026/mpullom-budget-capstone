'use client'
import { useContext, useState } from "react";
import { usePathname } from 'next/navigation';
import { createUser, updateUser } from '@/lib/userApi';
import { AuthContext } from "@/context/AuthContext";

interface ProfileEditorProps {
    onSwitchToLogin?: () => void;
}

export default function ProfileEditor({ onSwitchToLogin }: ProfileEditorProps) {
    const [firstNameInput, setFirstNameInput] = useState<string>("");
    const [lastNameInput, setLastNameInput] = useState<string>("");
    const [phoneNumberInput, setPhoneNumberInput] = useState<string>("");
    const [emailInput, setEmailInput] = useState<string>("");
    const [passInput, setPassInput] = useState<string>("");
    const pathname = usePathname();

    const { currentUser } = useContext(AuthContext);

    async function handleSignUp() {
        if (pathname === '/') {
            await createUser({
                firstName: firstNameInput,
                lastName: lastNameInput,
                email: emailInput,
                phoneNumber: phoneNumberInput,
                password: passInput
            });
            onSwitchToLogin?.();
        } else {
            console.log("Skipping sign up based on pathname:", pathname);
        }
    }

    async function handleEdit() {
        if (currentUser == null) {
            console.log("Skipping edit as current user is null");
        }
        if (pathname.startsWith('/dashboard')) {
            if (currentUser != null) {
                await updateUser({
                    firstName: firstNameInput,
                    lastName: lastNameInput,
                    email: emailInput,
                    phoneNumber: phoneNumberInput,
                    password: passInput
                }, currentUser.token);
            }
            else {
                console.log("Skipping edit as current user is null");
            }

        } else {
            console.log("Skipping edit based on pathname:", pathname);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

            <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 bg-sky-400 rounded-2xl shadow-2xl border border-slate-600 flex flex-col gap-4">

                {pathname?.startsWith('/dashboard') && (
                    <div className="flex items-center justify-between pb-2 border-b border-sky-300/60">
                        <h2 className="text-lg font-bold text-slate-800">Edit Profile</h2>
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition text-sm font-bold cursor-pointer"
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="Firstname"
                        value={firstNameInput}
                        onChange={(e) => setFirstNameInput(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="Lastname"
                        value={lastNameInput}
                        onChange={(e) => setLastNameInput(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <input
                        type="tel"
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="Phone Number"
                        value={phoneNumberInput}
                        onChange={(e) => setPhoneNumberInput(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                        type="email"
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="••••••••"
                        value={passInput}
                        onChange={(e) => setPassInput(e.target.value)}
                    />
                </div>



                {pathname == "/" && (<div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        className="flex-1 py-2.5 px-4 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                        onClick={handleSignUp}
                    >
                        Accept
                    </button>
                </div>)}

                {pathname.startsWith('/dashboard') && (<div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        className="flex-1 py-2.5 px-4 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                        onClick={handleEdit}
                    >
                        Accept Changes
                    </button>
                </div>)}
            </div>
        </div>
    );
}