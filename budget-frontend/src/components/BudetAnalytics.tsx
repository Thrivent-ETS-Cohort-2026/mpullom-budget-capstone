'use client'

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { tallyBudgets } from "@/lib/budgetApi";
import TransactionFilterFetch from "./TransactionFilter";

interface BudgetAnalyticsProps {
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
}

export default function BudgetAnalytics({ startDate, setStartDate, endDate, setEndDate }: BudgetAnalyticsProps) {
    const [currentTally, setCurrentTally] = useState<number>(0);
    const [maxTally, setMaxTally] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useContext(AuthContext);

    async function handleSearch(fromDate: string, toDate: string) {
        if (!currentUser?.token) {
            return;
        }

        if (!fromDate || !toDate) {
            setError("Please select both a start and end date.");
            return;
        }

        setStartDate(fromDate);
        setEndDate(toDate);

        try {
            setLoading(true);
            setError(null);

            const startDateTime = `${fromDate}T00:00:00`;
            const endDateTime = `${toDate}T23:59:59`;

            const tallyResult = await tallyBudgets(currentUser.token, startDateTime, endDateTime);

            setCurrentTally(tallyResult.currentAmountTally ?? 0);
            setMaxTally((tallyResult.maxAmountTally ?? 0) > 0 ? tallyResult.maxAmountTally : 1);

        } catch (err) {
            console.error("Failed to fetch budget analytics:", err);
            setError("Failed to retrieve budget analytics.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser?.token && startDate && endDate) {
            handleSearch(startDate, endDate);
        }
    }, [currentUser, startDate, endDate]);

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