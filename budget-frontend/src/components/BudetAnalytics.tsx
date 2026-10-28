'use client'

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { tallyBudgets } from "@/lib/budgetApi";
import TransactionFilterFetch from "./TransactionFilter";

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

            const tallyResult = await tallyBudgets(currentUser.token, startDateTime, endDateTime);

            setCurrentTally(tallyResult.currentAmountTally ?? 0);
            setMaxTally(tallyResult.currentAmountTally > 0 ? tallyResult.maxAmountTally : 1);

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

    const progressPercent = maxTally > 0 ? Math.min(Math.max((currentTally / maxTally) * 100, 0), 100) : 0;
    const isOverBudget = currentTally > maxTally;

    return (
        <div className="w-full p-4 text-slate-200 flex flex-col gap-4 mb-4">
            <h2 className="text-lg font-bold text-sky-400">Total Spending</h2>

            <TransactionFilterFetch onSearch={handleSearch} />

            {error && <p className="text-xs text-rose-800 font-medium">{error}</p>}
            {loading && <p className="text-xs text-sky-400 animate-pulse">Calculating tally...</p>}

            <div className="w-full p-4 border border-sky-600 rounded-xl bg-sky-800 text-slate-100 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center text-sm font-semibold">
                    <span>Total Spent: <span className="text-emerald-400">${currentTally.toFixed(2)}</span></span>
                    <span>Max Total: <span className="text-slate-200">${maxTally.toFixed(2)}</span></span>
                </div>

                <div className="w-full bg-sky-950 rounded-full h-3.5 overflow-hidden border border-sky-600">
                    <div
                        className={`h-full transition-all duration-500 rounded-full ${
                            isOverBudget ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}