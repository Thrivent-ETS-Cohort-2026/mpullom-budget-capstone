'use client'

import { useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BudgetType } from "@/types/DataTypes";
import BudgetCard from "./BudgetCard";
import { createBudget, fetchBudgets } from "@/lib/budgetApi";
import { AuthContext } from "@/context/AuthContext";
import BudgetAnalytics from "./BudetAnalytics";

export default function BudgetList() {
    const router = useRouter();
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUser } = useContext(AuthContext);

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        setStartDate(`${year}-${month}-01`);
        setEndDate(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
    }, []);

    const loadBudgets = useCallback(async () => {
        if (currentUser != null) {
            try {
                const data = await fetchBudgets(currentUser.token);
                setBudgets(data);
            } catch (error) {
                console.error("Failed to fetch budgets:", error);
            } finally {
                setLoading(false);
            }
        } else {
            console.log("Token was null");
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadBudgets();
    }, [loadBudgets]);

    async function handleCreateBudget() {
        if (currentUser != null) {
            await createBudget(currentUser);
            await loadBudgets();
        } else {
            console.log("No user is signed in");
        }
    }

    function handleTransactions() {
        router.push('/budgeting/transactions');
    }

    function handleBudgetDeleted(budgetId: number) {
        setBudgets(prevBudgets => prevBudgets.filter(b => b.id !== budgetId));
    }

    if (loading || !startDate || !endDate) {
        return <main className="p-4">Loading budgets...</main>;
    }

    const formattedStart = `${startDate}T00:00:00`;
    const formattedEnd = `${endDate}T23:59:59`;

    return (
        <main className="p-4 w-full">
            <h1 className="text-2xl font-bold mb-3">Budgeting</h1>
            
            <BudgetAnalytics 
                startDate={startDate} 
                setStartDate={setStartDate} 
                endDate={endDate} 
                setEndDate={setEndDate} 
            />

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
                            startDate={formattedStart}
                            endDate={formattedEnd}
                            onDeleted={() => handleBudgetDeleted(budget.id)}
                        />
                    ))
                )}
            </div>
        </main>
    );
}