'use client'
import { useContext, useState } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { createUser, updateUser } from '@/lib/userApi';
import { AuthContext } from "@/context/AuthContext";
import Notification from "./Notification";

interface ProfileEditorProps {
    onSwitchToLogin?: () => void;
}

export default function ProfileEditor({ onSwitchToLogin }: ProfileEditorProps) {
    const [firstNameInput, setFirstNameInput] = useState<string>("");
    const [lastNameInput, setLastNameInput] = useState<string>("");
    const [phoneNumberInput, setPhoneNumberInput] = useState<string>("");
    const [emailInput, setEmailInput] = useState<string>("");
    const [passInput, setPassInput] = useState<string>("");
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    
    const pathname = usePathname();
    const { currentUser } = useContext(AuthContext);

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhoneNumber = (phone: string) => /^\+?[\d\s\-()]{7,15}$/.test(phone);

    async function handleSignUp() {
        if (pathname === '/') {
            if (!firstNameInput.trim() || !lastNameInput.trim() || !emailInput.trim() || !phoneNumberInput.trim() || !passInput.trim()) {
                setNotificationMessage("All fields are required for sign up.");
                return;
            }

            if (!isValidEmail(emailInput)) {
                setNotificationMessage("Please enter a valid email address.");
                return;
            }

            if (!isValidPhoneNumber(phoneNumberInput)) {
                setNotificationMessage("Please enter a valid phone number.");
                return;
            }

            try {
                await createUser({
                    firstName: firstNameInput,
                    lastName: lastNameInput,
                    email: emailInput,
                    phoneNumber: phoneNumberInput,
                    password: passInput
                });
                onSwitchToLogin?.();
            } catch (err: any) {
                setNotificationMessage(err.message || "Failed to sign up.");
            }
        } else {
            console.log("Skipping sign up based on pathname:", pathname);
        }
    }

    async function handleEdit() {
        if (pathname.startsWith('/dashboard')) {
            if (currentUser == null) {
                console.log("Skipping edit as current user is null");
                return;
            }

            if (emailInput.trim() && !isValidEmail(emailInput)) {
                setNotificationMessage("The email address is in the wrong format.");
                return;
            }

            if (phoneNumberInput.trim() && !isValidPhoneNumber(phoneNumberInput)) {
                setNotificationMessage("The phone number is in the wrong format.");
                return;
            }

            try {
                const updatePayload: any = {
                    firstName: firstNameInput.trim() || currentUser.firstName,
                    lastName: lastNameInput.trim() || currentUser.lastName,
                    email: emailInput.trim() || currentUser.email,
                    phoneNumber: phoneNumberInput.trim() || currentUser.phoneNumber,
                };

                if (passInput.trim()) {
                    updatePayload.password = passInput.trim();
                }

                await updateUser(updatePayload, currentUser.token);
                setNotificationMessage("Profile updated successfully!");
                setPassInput("");
                
                setTimeout(() => {
                    onSwitchToLogin?.();
                }, 1200);
            } catch (err: any) {
                setNotificationMessage(err.message || "Failed to update profile.");
            }
        } else {
            console.log("Skipping edit based on pathname:", pathname);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <Notification
                message={notificationMessage}
                onClose={() => setNotificationMessage("")}
            />

            <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 bg-sky-400 rounded-2xl shadow-2xl border border-slate-600 flex flex-col gap-4">

                {pathname === '/' && (
                    <div className="flex items-center justify-between pb-2 border-b border-sky-300/60">
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                        >
                            ← Back
                        </button>
                        <h2 className="text-lg font-bold text-slate-800">Sign Up</h2>
                    </div>
                )}

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
                    <label className="text-sm font-medium text-slate-700">
                        {pathname.startsWith('/dashboard') ? "New Password" : "Password"}
                    </label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="••••••••"
                        value={passInput}
                        onChange={(e) => setPassInput(e.target.value)}
                    />
                </div>

                {pathname === "/" && (
                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            className="flex-1 py-2.5 px-4 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                            onClick={handleSignUp}
                        >
                            Accept
                        </button>
                    </div>
                )}

                {pathname.startsWith('/dashboard') && (
                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            className="flex-1 py-2.5 px-4 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                            onClick={handleEdit}
                        >
                            Accept Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}