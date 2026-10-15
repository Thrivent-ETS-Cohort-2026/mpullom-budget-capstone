'use client'

import { useState, useEffect, useContext } from "react";
import { BudgetType } from "@/types/DataTypes";
import BudgetCard from "./BudgetCard";
import { fetchBudgets } from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";

export default function BudgetList() {
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUser } = useContext(AuthContext);


useEffect(() => {
        async function loadBudgets() {
            if (currentUser != null) {
                const data = await fetchBudgets(currentUser?.token);
                setBudgets(data)
                setLoading(false);
            } else {
                console.log("Token was null")
                setLoading(false);
            }
        }

        loadBudgets();
    }, [currentUser]);

    if (loading) {
        return <main className="p-4">Loading budgets...</main>;
    }

    return (
        <main className="p-4 max-w-2xl">
            <h1 className="w-full text-2xl font-bold mb-4">Budgeting</h1>

            <div className="flex flex-col gap-3">
                {budgets.length === 0 ? (
                    <p className="text-slate-600 font-medium">No active budgets found.</p>
                ) : (
                    budgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                        />
                    ))
                )}
            </div>
        </main>
    );
}