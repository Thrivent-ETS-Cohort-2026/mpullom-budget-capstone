import { useContext, useState } from "react";
import { BudgetType, TargetPeriod } from "@/types/DataTypes";
import { updateBudget } from "@/lib/budgetApi";
import { AuthContext } from "@/context/AuthContext";

export default function BudgetCard({ budget }: { budget: BudgetType }) {
    if (!budget) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(budget.description);
    const [currentAmount, setCurrentAmount] = useState(budget.currentAmount ?? 0);
    const [maxAmount, setMaxAmount] = useState(budget.maxAmount ?? 1);
    const [targetPeriod, setTargetPeriod] = useState<TargetPeriod>(budget.targetPeriod);
    const TARGET_PERIODS = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
    const { currentUser } = useContext(AuthContext);

    function handleEnable() { }
    function handleSummary() { }
    async function handleWithdraw() {
        if ((currentUser != null) && budget != null) {
            await updateBudget(currentUser.token,
                {
                    id: budget.id,
                    user: budget.user,
                    description: budget.description,
                    enabled: budget.enabled,
                    currentAmount: budget.currentAmount,
                    maxAmount: budget.maxAmount,
                    targetPeriod: budget.targetPeriod
                });
        }
        else {
            console.log("Null values: update was rejected")
        }

    }

    async function handleEdit() {
        if (isEditing) {
            if ((currentUser != null) && budget != null) {
                await updateBudget(currentUser.token,
                    {
                        id: budget.id,
                        user: budget.user,
                        description: description,
                        enabled: budget.enabled,
                        currentAmount: currentAmount,
                        maxAmount: maxAmount,
                        targetPeriod: targetPeriod
                    });
            }
            else {
                console.log("Null values: update was rejected")
            }
        }
        setIsEditing(!isEditing);
    }

    const percentage = (currentAmount / maxAmount) * 100;

    let textColor = "text-green-400";
    if (percentage >= 90) {
        textColor = "text-red-400";
    } else if (percentage >= 75) {
        textColor = "text-yellow-300";
    }

    return (
        <div className={`w-full p-3 border rounded-lg shadow-sm flex flex-col gap-2 transition-colors ${budget.enabled
            ? "bg-sky-600 text-slate-200"
            : "bg-slate-200 text-sky-600 border-slate-300"
            }`}>
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-0.5">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={!isEditing}
                        className={`font-semibold text-base bg-transparent border-2 rounded px-1 transition-colors ${isEditing ? "border-white bg-sky-700 text-white" : "border-sky-800 cursor-default"
                            }`}
                    />
                    <div className="flex items-center gap-1 text-xs mt-0.5">
                        <span className="font-bold">$</span>
                        <input
                            type="number"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(Number(e.target.value))}
                            disabled={!isEditing}
                            style={{ width: `${Math.max(currentAmount.toString().length + 2, 4)}ch` }}
                            className={`bg-transparent border-2 rounded px-1 font-bold transition-colors ${isEditing ? "border-white bg-sky-700 text-white" : "border-sky-800 cursor-default"
                                }`}
                        />
                        <span className="text-sky-200">/</span>
                        <select
                            value={targetPeriod}
                            onChange={(e) => setTargetPeriod(e.target.value as TargetPeriod)}
                            disabled={!isEditing}
                            className={`bg-transparent border-2 rounded px-1 text-xs transition-colors ${isEditing ? "border-white bg-sky-700 text-white cursor-pointer" : "border-sky-800 cursor-default appearance-none"
                                }`}
                        >
                            {Object.values(TARGET_PERIODS).map((period) => (
                                <option key={String(period)} value={period as string} className="bg-sky-700 text-white">
                                    {String(period)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={`flex items-center gap-1 text-xl font-extrabold mr-6 ${textColor}`}>
                    <div className={`bg-transparent border-transparent rounded px-1 text-right font-extrabold transition-colors`}>
                        ${Number(currentAmount).toFixed(2)}
                    </div>
                    <div>
                        /
                    </div>
                    <div className={`bg-transparent border-transparent rounded px-1 text-right font-extrabold transition-colors`}>
                        ${Number(maxAmount).toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-0.5 w-full">
                <div className="flex gap-2">
                    <button
                        onClick={handleEnable}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                    >
                        Enable
                    </button>
                    <button
                        onClick={handleSummary}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                    >
                        Summary
                    </button>
                    <button
                        onClick={handleWithdraw}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                    >
                        Withdraw
                    </button>
                </div>

                <button
                    onClick={handleEdit}
                    className={`px-3 py-1 text-xs font-medium rounded text-white transition-colors mr-6 ${isEditing
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-sky-700 hover:bg-sky-800"
                        }`}
                >
                    {isEditing ? "Accept Changes" : "Edit"}
                </button>
            </div>
        </div>
    );
}