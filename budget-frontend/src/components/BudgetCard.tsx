'use client'

import { useContext, useState, useEffect } from "react";
import { BudgetType } from "@/types/DataTypes";
import { updateBudget, deleteBudget, tallyBudgetCategoryTransactions } from "@/lib/budgetApi";
import { AuthContext } from "@/context/AuthContext";

interface BudgetCardProps {
    budget: BudgetType;
    startDate: string;
    endDate: string;
    onDeleted?: () => void;
    onEditBudget?: () => void;
}

export default function BudgetCard({ budget, startDate, endDate, onDeleted, onEditBudget }: BudgetCardProps) {
    if (!budget) return null;

    const [isEnabled, setIsEnabled] = useState(budget.enabled);
    const [currentAmount, setCurrentAmount] = useState(budget.currentAmount ?? 0);
    const [maxAmount, setMaxAmount] = useState(budget.maxAmount ?? 1);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        setIsEnabled(budget.enabled);
        if (budget.maxAmount !== undefined) {
            setMaxAmount(budget.maxAmount);
        }
    }, [budget.enabled, budget.maxAmount]);

    useEffect(() => {
        async function fetchCategoryTally() {
            if (currentUser?.token && budget?.id && startDate && endDate) {
                try {
                    const formattedStart = startDate.length === 10 ? `${startDate}T00:00:00` : startDate;
                    const formattedEnd = endDate.length === 10 ? `${endDate}T23:59:59` : endDate;

                    const tallyResult = await tallyBudgetCategoryTransactions(currentUser.token, budget.id, formattedStart, formattedEnd);
                    setCurrentAmount(tallyResult.currentAmountTally ?? 0);
                    if (tallyResult.maxAmountTally > 0) {
                        setMaxAmount(tallyResult.maxAmountTally);
                    }
                } catch (err) {
                    console.error("Failed to fetch tally for budget category:", err);
                }
            }
        }
        fetchCategoryTally();
    }, [currentUser, budget?.id, startDate, endDate]);

    async function handleEnableToggle() {
        if (currentUser != null && budget != null) {
            const nextEnabled = !isEnabled;
            setIsEnabled(nextEnabled);
            await updateBudget(currentUser.token, {
                ...budget,
                enabled: nextEnabled,
            });
        } else {
            console.log("Null values: update was rejected");
        }
    }

    async function handleDelete() {
        if (currentUser != null && budget != null) {
            try {
                await deleteBudget(currentUser.token, budget.id);
                if (onDeleted) {
                    onDeleted();
                }
            } catch (err) {
                console.error("Failed to delete budget:", err);
                alert("Failed to delete budget.");
            }
        } else {
            console.log("Null values: delete was rejected");
        }
    }

    const progressPercent = maxAmount > 0 ? Math.min(Math.max((currentAmount / maxAmount) * 100, 0), 100) : 0;
    const isOverBudget = currentAmount > maxAmount;

    let textColor = "text-emerald-400";
    if (progressPercent >= 90) {
        textColor = "text-rose-800";
    } else if (progressPercent >= 75) {
        textColor = "text-yellow-300";
    } else {
        textColor = "text-emerald-400";
    }

    return (
        <div className={`w-full p-3 border rounded-lg shadow-sm flex flex-col gap-2 transition-colors ${
            isEnabled
                ? "bg-sky-600 text-slate-200"
                : "bg-slate-600 text-sky-400 border-slate-300"
        }`}>
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-1.5">
                    <div className="font-semibold text-base text-white">
                        {budget.description || `Budget #${budget.id}`}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-sky-200">
                        <span className="font-bold">${maxAmount.toFixed(2)}</span>
                        <span>/</span>
                        <span>{budget.targetPeriod}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-sky-200 font-medium">Category:</span>
                        <span className="font-semibold text-white">{budget.category}</span>
                    </div>
                </div>

                <div className={`flex items-center gap-1 text-2xl font-extrabold mr-6 ${textColor}`}>
                    <div>${Number(currentAmount).toFixed(2)}</div>
                    <div>/</div>
                    <div>${Number(maxAmount).toFixed(2)}</div>
                </div>
            </div>

            <div className="w-full bg-sky-950 rounded-full h-3 overflow-hidden border border-sky-700 my-1">
                <div
                    className={`h-full transition-all duration-500 rounded-full ${
                        isOverBudget ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="flex justify-between items-center mt-0.5 w-full">
                <div className="flex gap-4 items-end">
                    <button
                        onClick={handleEnableToggle}
                        className="h-14 w-14 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors cursor-pointer"
                    >
                        {isEnabled ? "Disable" : "Enable"}
                    </button>
                </div>

                <div className="flex items-center gap-2 mr-6">
                    <button
                        onClick={onEditBudget}
                        className="px-3 py-1 text-xs font-medium rounded text-white bg-sky-700 hover:bg-sky-800 transition-colors h-6.5 cursor-pointer"
                    >
                        Edit
                    </button>

                    <button
                        onClick={handleDelete}
                        className="px-3 py-1 text-xs font-medium rounded text-white bg-rose-800 hover:bg-rose-700 transition-colors h-6.5 cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}