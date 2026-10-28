'use client'

import { useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Account } from "@/types/DataTypes";
import { fetchAccounts } from "@/lib/accountApi";
import { AuthContext } from "@/context/AuthContext";
import AccountCard from "./AccountCard";
import AccountEditor from "./AccountEditor";

export default function AccountList() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const { currentUser } = useContext(AuthContext);

    const loadAccounts = useCallback(async (isInitialLoad = false) => {
        if (currentUser?.token != null) {
            try {
                const data = await fetchAccounts(currentUser.token);
                setAccounts(data);
            } catch (err) {
                console.error("Failed to fetch accounts:", err);
            } finally {
                if (isInitialLoad) {
                    setLoading(false);
                }
            }
        } else {
            console.log("Token was null");
            if (isInitialLoad) {
                setLoading(false);
            }
        }
    }, [currentUser?.token]);

    useEffect(() => {
        loadAccounts(true);
    }, [loadAccounts]);

    function handleSummary() {
        console.log("Viewing transactions summary");
        router.push('/banking/transactions');
    }

    function handleAccountCreation() {
        setIsCreating(true);
        setEditingAccount(null); 
    }

    function handleEditorClose() {
        setIsCreating(false);
        setEditingAccount(null);
    }

    function handleEditorSaved() {
        loadAccounts(false);
        setIsCreating(false);
        setEditingAccount(null);
    }

    if (loading) {
        return <main className="p-4">Loading accounts...</main>;
    }

    const sortedAccounts = [...accounts].sort((a, b) => a.accountNumber - b.accountNumber);

    return (
        <main className="p-4 w-full">
            {(isCreating || editingAccount !== null) && (
                <AccountEditor
                    account={editingAccount}
                    onClose={handleEditorClose}
                    onSaved={handleEditorSaved}
                />
            )}

            <div className="flex justify-between items-center w-full mb-4">
                <h1 className="text-2xl font-bold">Banking</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAccountCreation}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-800 text-sm font-medium rounded-lg text-white transition-colors shadow"
                    >
                        Create Account
                    </button>
                    <button
                        onClick={handleSummary}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-800 text-sm font-medium rounded-lg text-white transition-colors shadow"
                    >
                        Transactions
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col gap-3 items-stretch">
                {sortedAccounts.length === 0 ? (
                    <p className="text-slate-600 font-medium">No accounts found.</p>
                ) : (
                    sortedAccounts.map((account) => (
                        <AccountCard
                            key={account.accountNumber}
                            account={account}
                            onAccountUpdated={() => loadAccounts(false)}
                            onEditAccount={() => setEditingAccount(account)}
                        />
                    ))
                )}
            </div>
        </main>
    );
}