'use client'

import { useContext, useState, useEffect } from "react";
import { tallyBudgetAmounts } from "@/lib/budgetApi"; 
import { AuthContext } from "@/context/AuthContext";
import { BudgetTallyResponse } from "@/types/DataTypes";
import TransactionFilterFetch from "./TransactionFilter";

export default function BudgetAnalytics() {
    const [tallyData, setTallyData] = useState<BudgetTallyResponse | null>(null);
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
        if (!currentUser) {
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

            const result = await tallyBudgetAmounts(
                currentUser.token, 
                startDateTime, 
                endDateTime
            );

            setTallyData(result);
        } catch (err) {
            console.error("Failed to fetch budget tally:", err);
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

    const currentTally = tallyData?.currentAmountTally ?? 0;
    const maxTally = tallyData?.maxAmountTally ?? 1;
    const percentage = maxTally > 0 ? (currentTally / maxTally) * 100 : 0;

    let textColor = "text-green-400";
    if (percentage >= 90) {
        textColor = "text-green-400";
    } else if (percentage >= 75) {
        textColor = "text-yellow-300";
    } else {
        textColor = "text-red-400";
    }

    return (
        <div className="w-full p-4 rounded-lg shadow-sm bg-slate-800 text-slate-200 flex flex-col gap-4 mb-4">
            <h2 className="text-lg font-bold text-sky-400">Total Spending</h2>

            <TransactionFilterFetch onSearch={handleSearch} />

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
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