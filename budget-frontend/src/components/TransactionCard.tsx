'use client'

import { useState, useContext } from "react";
import { Transaction } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { deleteTransaction } from "@/lib/transactionApi";
import Notification from "./Notification";

interface TransactionCardProps {
    transaction: Transaction;
    onDeleted?: () => void;
}

export default function TransactionCard({ transaction, onDeleted }: TransactionCardProps) {
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const { currentUser } = useContext(AuthContext);

    if (!transaction) return null;

    async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser) return;
        
        try {
            if (transaction.transactionId != null) {
                await deleteTransaction(currentUser.token, transaction.transactionId);
                if (onDeleted) {
                    onDeleted();
                }
            }
        } catch (err: any) {
            console.error("Failed to delete transaction:", err);
            setNotificationMessage(err.message || "Failed to delete transaction.");
        }
    }

    let displayDescription = transaction.description || "No description";
    const isTransfer = transaction.transactionType?.toString().includes("TRANSFER");

    if (isTransfer) {
        displayDescription = displayDescription
            .replace(/withdrawal/gi, "")
            .replace(/deposit/gi, "")
            .replace(/from Account/gi, "from Account")
            .replace(/to Account/gi, "to Account")
            .replace(/\s+/g, " ")
            .trim();
        
        if (!displayDescription.toLowerCase().includes("transfer")) {
            displayDescription = `Transfer ${displayDescription}`;
        }
    }

    const isRecurrent = (transaction.recurrencePeriod ?? 0) > 0;
    if (isRecurrent && !displayDescription.startsWith("[Recurrent]")) {
        displayDescription = `[Recurrent] ${displayDescription}`;
    }

    return (
        <div className="w-full p-4 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 flex justify-between items-center shadow-sm">
            <Notification
                message={notificationMessage}
                onClose={() => setNotificationMessage("")}
            />

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sky-400">{transaction.transactionType}</span>
                    <span className="px-2 py-0.5 bg-sky-900 text-sky-200 text-xs font-medium rounded-full border border-sky-700">
                        {transaction.category || (isTransfer ? "TRANSFER" : "GENERAL")}
                    </span>
                </div>
                <span className="text-sm text-slate-300">{displayDescription}</span>
                <span className="text-xs text-slate-500">
                    {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : "No timestamp"}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-emerald-400">
                    ${Number(transaction.amount ?? 0).toFixed(2)}
                </span>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-xs font-medium rounded text-white transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}