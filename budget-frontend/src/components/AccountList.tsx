'use client'

import { useState, useEffect, useContext } from "react";
import { Account } from "@/types/DataTypes";
import { fetchAccounts } from "@/lib/accountApi";
import { AuthContext } from "@/context/AuthContext";
import AccountCard from "./AccountCard";

export default function AccountList() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        async function loadAccounts() {
            if (currentUser != null) {
                const data = await fetchAccounts(currentUser?.token);
                setAccounts(data);
                setLoading(false);
            } else {
                console.log("Token was null");
                setLoading(false);
            }
        }

        loadAccounts();
    }, [currentUser]);

    async function handleCreateAccount() {
        // createAccount({
            
        // })
    };

    if (loading) {
        return <main className="p-4">Loading accounts...</main>;
    }

    return (
        <main className="p-4 w-full">
            <div className="flex justify-between items-center w-full mb-4">
                <h1 className="text-2xl font-bold">Banking</h1>
                <button 
                    onClick={handleCreateAccount}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg shadow transition-colors"
                >
                    Create Account
                </button>
            </div>

            <div className="w-full flex flex-col gap-3 items-stretch">
                {accounts.length === 0 ? (
                    <p className="text-slate-600 font-medium">No accounts found.</p>
                ) : (
                    accounts.map((account) => (
                        <AccountCard
                            key={account.accountNumber}
                            account={account}
                        />
                    ))
                )}
            </div>
        </main>
    );
}