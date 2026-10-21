'use client'

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { BudgetType } from "@/types/DataTypes";
import BudgetCard from "./BudgetCard";
import { createBudget, fetchBudgets } from "@/lib/budgetApi";
import { AuthContext } from "@/context/AuthContext";

export default function BudgetList() {
    const router = useRouter();
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUser } = useContext(AuthContext);

    async function loadBudgets() {
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
    }

    useEffect(() => {
        loadBudgets();
    }, [currentUser]);

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

    if (loading) {
        return <main className="p-4">Loading budgets...</main>;
    }

    return (
        <main className="p-4 w-full">
            <div className="flex justify-between items-center w-full mb-4">
                <h1 className="text-2xl font-bold">Budgeting</h1>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleTransactions}
                        className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-sm font-medium rounded-lg text-white transition-colors shadow"
                    >
                        Transactions
                    </button>
                    <button 
                        onClick={handleCreateBudget}
                        className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-sm font-medium rounded-lg text-white transition-colors shadow"
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