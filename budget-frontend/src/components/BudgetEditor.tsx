'use client'

import { useState, useContext, useEffect } from "react";
import { BudgetType, TargetPeriod, Category } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { updateBudget, createBudget } from "@/lib/budgetApi";
import Notification from "./Notification";

interface BudgetEditorProps {
    budget?: BudgetType | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function BudgetEditor({ budget, onClose, onSaved }: BudgetEditorProps) {
    const isEditing = budget != null;

    const [description, setDescription] = useState<string>("");
    const [maxAmount, setMaxAmount] = useState<string>("100");
    const [targetPeriod, setTargetPeriod] = useState<TargetPeriod>(TargetPeriod.MONTHLY);
    const [category, setCategory] = useState<Category>(Category.FOOD);
    const [enabled, setEnabled] = useState<boolean>(true);

    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const { currentUser } = useContext(AuthContext);

    const TARGET_PERIODS = Object.values(TargetPeriod);
    const CATEGORIES = Object.values(Category);

    const cleanTimestamp = (isoString?: string) => {
        if (!isoString) return undefined;
        return isoString.split('.')[0].replace('Z', '');
    };

    useEffect(() => {
        if (budget) {
            setDescription(budget.description ?? "");
            setMaxAmount(String(budget.maxAmount ?? 100));
            setTargetPeriod(budget.targetPeriod ?? TargetPeriod.MONTHLY);
            setCategory(budget.category ?? Category.FOOD);
            setEnabled(budget.enabled ?? true);
        } else {
            setDescription("New Budget");
            setMaxAmount("100");
            setTargetPeriod(TargetPeriod.MONTHLY);
            setCategory(Category.FOOD);
            setEnabled(true);
        }
    }, [budget]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser) return;

        const parsedMaxAmount = parseFloat(maxAmount);
        if (isNaN(parsedMaxAmount) || parsedMaxAmount <= 0) {
            setNotificationMessage("Please enter a valid maximum amount greater than zero.");
            return;
        }

        try {
            if (isEditing && budget) {
                const updatedBudget: BudgetType = {
                    ...budget,
                    description: description.trim() || `Budget #${budget.id}`,
                    maxAmount: parsedMaxAmount,
                    targetPeriod,
                    category,
                    enabled,
                    startDate: cleanTimestamp(budget.startDate) as any,
                };

                await updateBudget(currentUser.token, updatedBudget);
                setNotificationMessage("Successfully updated budget!");
            } else {
                await createBudget(currentUser, {
                    description: description.trim() || "New Budget",
                    maxAmount: parsedMaxAmount,
                    currentAmount: 0,
                    targetPeriod,
                    category,
                    enabled,
                    startDate: new Date().toISOString()
                });
                setNotificationMessage("Successfully created budget!");
            }

            // Brief delay so the user sees the success notification before the modal closes
            setTimeout(() => {
                onSaved();
            }, 600);
        } catch (err: any) {
            console.error("Failed to save budget:", err);
            setNotificationMessage(err.message || "Failed to save budget.");
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <Notification
                message={notificationMessage}
                onClose={() => setNotificationMessage("")}
            />

            <div className="relative w-full max-w-xl bg-sky-600 rounded-2xl shadow-2xl border border-slate-600 flex flex-col text-slate-100">
                
                <div className="px-6 pt-6 pb-3 border-b border-sky-500/60 flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-bold text-white">
                        {isEditing ? `Edit Budget #${budget?.id}` : "Create New Budget"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-rose-800 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition text-sm font-bold cursor-pointer shrink-0"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSave} className="px-6 py-4 flex flex-col gap-3 flex-1">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-sky-200">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="px-3 py-2 rounded bg-sky-900 border border-sky-500 text-white placeholder-sky-300 focus:outline-none focus:ring-1 focus:ring-white text-sm"
                            placeholder="Budget description..."
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-sky-200">Max Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            className="px-3 py-2 rounded bg-sky-900 border border-sky-500 text-white placeholder-sky-300 focus:outline-none focus:ring-1 focus:ring-white text-sm"
                            placeholder="100.00"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-sky-200">Target Period</label>
                        <select
                            value={targetPeriod}
                            onChange={(e) => setTargetPeriod(e.target.value as TargetPeriod)}
                            className="px-3 py-2 rounded bg-sky-900 border border-sky-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white cursor-pointer"
                        >
                            {TARGET_PERIODS.map((period) => (
                                <option key={period} value={period} className="bg-sky-900 text-white">
                                    {period}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-sky-200">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="px-3 py-2 rounded bg-sky-900 border border-sky-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white cursor-pointer"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} className="bg-sky-900 text-white">
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="budgetEnabled"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="w-4 h-4 rounded bg-sky-900 border-sky-500 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <label htmlFor="budgetEnabled" className="text-xs font-medium text-sky-200 cursor-pointer">
                            Enabled
                        </label>
                    </div>

                    <div className="pt-4 mt-2 border-t border-sky-500/60 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-xs font-medium rounded text-white transition-colors cursor-pointer shadow"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors cursor-pointer shadow"
                        >
                            {isEditing ? "Save Changes" : "Create Budget"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}