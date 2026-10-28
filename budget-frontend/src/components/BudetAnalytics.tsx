'use client'

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { BudgetType, Transaction } from "@/types/DataTypes";
import { fetchBudgets } from "@/lib/budgetApi";
import TransactionFilterFetch from "./TransactionFilter";
import { getTransactions } from "@/lib/transactionApi";

export default function BudgetAnalytics() {
    const [currentTally, setCurrentTally] = useState<number>(0);
    const [maxTally, setMaxTally] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useContext(AuthContext);

    const getFormattedDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const defaultFrom = getFormattedDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const defaultTo = getFormattedDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));

    async function handleSearch(fromDate: string, toDate: string) {
        if (!currentUser?.token) {
            return;
        }

        if (!fromDate || !toDate) {
            setError("Please select both a start and end date.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const startDateTime = `${fromDate}T00:00:00`;
            const endDateTime = `${toDate}T23:59:59`;

            const budgetsData: BudgetType[] = await fetchBudgets(currentUser.token).catch(() => []);
            const totalMax = (budgetsData || []).reduce((acc, b) => acc + (b.maxAmount ?? 0), 0);
            setMaxTally(totalMax > 0 ? totalMax : 1);

            const transactionsData: Transaction[] = await getTransactions(
                currentUser.token,
                startDateTime,
                endDateTime
            ).catch(() => []);

            const totalCurrent = (transactionsData || []).reduce((acc, t) => acc + (t.amount ?? 0), 0);
            setCurrentTally(totalCurrent);

        } catch (err) {
            console.error("Failed to fetch budget analytics:", err);
            setError("Failed to retrieve budget analytics.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser?.token) {
            handleSearch(defaultFrom, defaultTo);
        }
    }, [currentUser]);

    const percentage = maxTally > 0 ? (currentTally / maxTally) * 100 : 0;

    let textColor = "text-emerald-400";
    if (percentage >= 90) {
        textColor = "text-emerald-400";
    } else if (percentage >= 75) {
        textColor = "text-yellow-300";
    } else {
        textColor = "text-rose-800";
    }

    return (
        <div className="w-full p-4 text-slate-200 flex flex-col gap-4 mb-4">
            <h2 className="text-lg font-bold text-sky-400">Total Spending</h2>

            <TransactionFilterFetch onSearch={handleSearch} />

            {error && <p className="text-xs text-rose-800 font-medium">{error}</p>}
            {loading && <p className="text-xs text-sky-400 animate-pulse">Calculating tally...</p>}

            <div className="flex justify-between items-center bg-sky-900/50 p-4 rounded-lg border border-sky-700">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Filtered Tally Summary</span>
                    <span className="text-sm font-semibold text-white">Current vs Max Total</span>
                </div>

                <div className={`flex items-center gap-1 text-2xl font-extrabold mr-2 ${textColor}`}>
                    <div className="bg-transparent border-transparent rounded px-1 text-right font-extrabold">
                        ${Number(currentTally).toFixed(2)}
                    </div>
                    <div>/</div>
                    <div className="bg-transparent border-transparent rounded px-1 text-right font-extrabold">
                        ${Number(maxTally).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}