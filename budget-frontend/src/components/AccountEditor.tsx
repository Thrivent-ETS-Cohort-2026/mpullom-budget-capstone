'use client'

import { useState, useContext, useEffect } from "react";
import { Account } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { createAccount, updateAccount } from "@/lib/accountApi";
import Notification from "./Notification";

interface AccountEditorProps {
    account?: Account | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function AccountEditor({ account, onClose, onSaved }: AccountEditorProps) {
    const { currentUser } = useContext(AuthContext);
    const [notificationMessage, setNotificationMessage] = useState<string>("");

    const [accountType, setAccountType] = useState<string>("CHECKING");
    const [balance, setBalance] = useState<string>("");
    const [accountStatus, setAccountStatus] = useState<string>("ACTIVE");

    useEffect(() => {
        if (account) {
            setAccountType(account.accountType || "CHECKING");
            setBalance(account.balance != null ? account.balance.toString() : "");
            setAccountStatus(account.accountStatus || "ACTIVE");
        } else {
            setAccountType("CHECKING");
            setBalance("");
            setAccountStatus("ACTIVE");
        }
    }, [account]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser) return;

        try {
            // Include 'user' so backend validation and user association succeed
            const accountData: any = {
                accountType,
                balance: parseFloat(balance) || 0,
                accountStatus,
                user: currentUser
            };

            if (account && account.accountNumber != null) {
                await updateAccount(currentUser.token, account.accountNumber, accountData);
            } else {
                await createAccount(currentUser.token, accountData);
            }

            onSaved();
            onClose();
        } catch (err: any) {
            console.error("Failed to save account:", err);
            setNotificationMessage(err.message || "Failed to save account.");
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md p-6 border border-sky-600 rounded-xl bg-sky-800 text-slate-100 flex flex-col gap-4 shadow-2xl">
                <Notification
                    message={notificationMessage}
                    onClose={() => setNotificationMessage("")}
                />

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {account ? `Edit Account #${account.accountNumber}` : "Create New Account"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs text-white hover:bg-rose-700 px-2.5 py-1.5 bg-rose-800 rounded border border-sky-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Account Type</label>
                        <select
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
                            className="px-3 py-2 rounded bg-sky-900 border border-sky-600 text-white"
                        >
                            <option value="CHECKING">CHECKING</option>
                            <option value="SAVINGS">SAVINGS</option>
                            <option value="CREDIT">CREDIT</option>
                            <option value="INVESTMENT">INVESTMENT</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Initial Balance</label>
                        <input
                            type="number"
                            step="0.01"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="px-3 py-2 rounded bg-sky-900 border border-sky-600 text-white"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Account Status</label>
                        <select
                            value={accountStatus}
                            onChange={(e) => setAccountStatus(e.target.value)}
                            className="px-3 py-2 rounded bg-sky-900 border border-sky-600 text-white"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg text-white transition-colors shadow"
                    >
                        {account ? "Update Account" : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}