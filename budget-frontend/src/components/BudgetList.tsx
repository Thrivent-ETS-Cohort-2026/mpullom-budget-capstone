'use client'

import { useState, useEffect, useContext, useCallback } from "react";
import { BudgetType } from "@/types/DataTypes";
import BudgetCard from "./BudgetCard";
import BudgetEditor from "./BudgetEditor";
import { fetchBudgets } from "@/lib/budgetApi";
import { AuthContext } from "@/context/AuthContext";
import BudgetAnalytics from "./BudetAnalytics";

export default function BudgetList() {
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [editingBudget, setEditingBudget] = useState<BudgetType | null>(null);

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
                setBudgets([...data]);
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

    function handleBudgetCreation() {
        setIsCreating(true);
        setEditingBudget(null);
    }

    function handleEditorClose() {
        setIsCreating(false);
        setEditingBudget(null);
    }

    function handleEditorSaved() {
        loadBudgets();
        setIsCreating(false);
        setEditingBudget(null);
    }

    function handleBudgetDeleted(budgetId: number) {
        setBudgets(prevBudgets => prevBudgets.filter(b => b.id !== budgetId));
    }

    if (loading || !startDate || !endDate) {
        return <main className="p-4">Loading budgets...</main>;
    }

    const formattedStart = `${startDate}T00:00:00`;
    const formattedEnd = `${endDate}T23:59:59`;

    const sortedBudgets = [...budgets].sort((a, b) => {
        const descA = (a.description || `Budget #${a.id}`).toLowerCase();
        const descB = (b.description || `Budget #${b.id}`).toLowerCase();
        return descA.localeCompare(descB);
    });

    return (
        <main className="p-4 w-full relative">
            {(isCreating || editingBudget !== null) && (
                <BudgetEditor
                    budget={editingBudget}
                    onClose={handleEditorClose}
                    onSaved={handleEditorSaved}
                />
            )}

            <h1 className="text-2xl font-bold mb-3">Budgeting</h1>
            
            <BudgetAnalytics 
                key={JSON.stringify(budgets)} 
                startDate={startDate} 
                setStartDate={setStartDate} 
                endDate={endDate} 
                setEndDate={setEndDate} 
            />

            <div className="flex justify-end items-center w-full mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleBudgetCreation}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-800 text-sm font-medium rounded-lg text-white transition-colors shadow cursor-pointer"
                    >
                        Create Budget
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col gap-3 items-stretch">
                {sortedBudgets.length === 0 ? (
                    <p className="text-slate-600 font-medium">No active budgets found.</p>
                ) : (
                    sortedBudgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            startDate={formattedStart}
                            endDate={formattedEnd}
                            onDeleted={() => handleBudgetDeleted(budget.id)}
                            onEditBudget={() => setEditingBudget(budget)}
                            onBudgetUpdated={loadBudgets}
                        />
                    ))
                )}
            </div>
        </main>
    );
}