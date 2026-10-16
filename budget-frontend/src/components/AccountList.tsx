'use client'

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Account } from "@/types/DataTypes";
import { fetchAccounts } from "@/lib/accountApi";
import { AuthContext } from "@/context/AuthContext";
import AccountCard from "./AccountCard";

export default function AccountList() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        async function loadAccounts() {
            if (currentUser != null) {
                try {
                    const data = await fetchAccounts(currentUser?.token);
                    setAccounts(data);
                } catch (err) {
                    console.error("Failed to fetch accounts:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                console.log("Token was null");
                setLoading(false);
            }
        }

        loadAccounts();
    }, [currentUser]);

    function handleSummary() {
        console.log("Viewing transactions summary");
        router.push('/dashboard/banking/transactions');
    }

    if (loading) {
        return <main className="p-4">Loading accounts...</main>;
    }

    return (
        <main className="p-4 w-full">
            <div className="flex justify-between items-center w-full mb-4">
                <h1 className="text-2xl font-bold">Banking</h1>
                <button
                    onClick={handleSummary}
                    className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors h-6.5"
                >
                    Transactions
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