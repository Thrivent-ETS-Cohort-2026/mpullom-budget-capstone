'use client'

import { useState, useEffect, useContext } from "react";
import { Transaction } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import TransactionCard from "./TransactionCard";

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        async function loadTransactions() {
            if (currentUser != null) {
                try {
                    const response = await fetch("http://localhost:8080/api/transactions", {
                        headers: {
                            "Authorization": `Bearer ${currentUser.token}`
                        }
                    });
                    const data = await response.json();
                    setTransactions(data);
                } catch (err) {
                    console.error("Failed to fetch transactions:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                console.log("Token was null");
                setLoading(false);
            }
        }

        loadTransactions();
    }, [currentUser]);

    if (loading) {
        return <main className="p-4">Loading transactions...</main>;
    }

    return (
        <main className="p-4 w-full">
            <div className="flex justify-between items-center w-full mb-4">
                <h1 className="text-2xl font-bold">Transactions</h1>
            </div>

            <div className="w-full flex flex-col gap-3 items-stretch">
                {transactions.length === 0 ? (
                    <p className="text-slate-600 font-medium">No transactions found.</p>
                ) : (
                    transactions.map((transaction) => (
                        <TransactionCard
                            key={transaction.transactionId}
                            transaction={transaction}
                        />
                    ))
                )}
            </div>
        </main>
    );
}