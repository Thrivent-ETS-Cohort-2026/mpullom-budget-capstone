'use client'

import { useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BudgetType } from "@/types/DataTypes";
import BudgetCard from "./BudgetCard";
import { createBudget, fetchBudgets, tallyBudgets } from "@/lib/budgetApi";
import { AuthContext } from "@/context/AuthContext";
import BudgetAnalytics from "./BudetAnalytics";

export default function BudgetList() {
    const router = useRouter();
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [totalSpent, setTotalSpent] = useState<number>(0);
    const [totalMax, setTotalMax] = useState<number>(0);

    const { currentUser } = useContext(AuthContext);

    const loadBudgetData = useCallback(async () => {
        if (currentUser != null) {
            try {
                const data = await fetchBudgets(currentUser.token);
                setBudgets(data);

                const startDate = "2026-10-01T00:00:00";
                const endDate = "2026-10-31T23:59:59";

                const tallyResult = await tallyBudgets(currentUser.token, startDate, endDate);
                setTotalSpent(tallyResult.currentAmountTally ?? 0);
                setTotalMax(tallyResult.maxAmountTally ?? 0);
            } catch (error) {
                console.error("Failed to fetch budget data or tallies:", error);
            } finally {
                setLoading(false);
            }
        } else {
            console.log("Token was null");
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadBudgetData();
    }, [loadBudgetData]);

    async function handleCreateBudget() {
        if (currentUser != null) {
            await createBudget(currentUser);
            await loadBudgetData();
        } else {
            console.log("No user is signed in");
        }
    }

    function handleTransactions() {
        router.push('/budgeting/transactions');
    }

    function handleBudgetDeleted(budgetId: number) {
        setBudgets(prevBudgets => prevBudgets.filter(b => b.id !== budgetId));
        loadBudgetData();
    }

    const progressPercent = totalMax > 0 ? Math.min(Math.max((totalSpent / totalMax) * 100, 0), 100) : 0;
    const isOverBudget = totalSpent > totalMax;

    if (loading) {
        return <main className="p-4">Loading budgets...</main>;
    }

    return (
        <main className="p-4 w-full">
            <h1 className="text-2xl font-bold mb-3">Budgeting</h1>
            <BudgetAnalytics />

            <div className="w-full p-4 mb-4 border border-sky-600 rounded-xl bg-sky-800 text-slate-100 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center text-sm font-semibold">
                    <span>Total Spent: <span className="text-emerald-400">${totalSpent.toFixed(2)}</span></span>
                    <span>Max Total: <span className="text-slate-200">${totalMax.toFixed(2)}</span></span>
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

            <div className="flex justify-end items-center w-full mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleTransactions}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-800 text-sm font-medium rounded-lg text-white transition-colors shadow"
                    >
                        Transactions
                    </button>
                    <button
                        onClick={handleCreateBudget}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-800 text-sm font-medium rounded-lg text-white transition-colors shadow"
                    >
                        Create Budget
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col gap-3 items-stretch">
                {budgets.length === 0 ? (
                    <p className="text-slate-600 font-medium">No active budgets found.</p>
                ) : (
                    budgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            onDeleted={() => handleBudgetDeleted(budget.id)}
                        />
                    ))
                )}
            </div>
        </main>
    );
}