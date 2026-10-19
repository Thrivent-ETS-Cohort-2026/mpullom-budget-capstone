import { useContext, useState } from "react";
import { BudgetType, TargetPeriod, TransactionType } from "@/types/DataTypes";
import { updateBudget } from "@/lib/budgetApi";
import { createTransaction } from "@/lib/transactionApi";
import { AuthContext } from "@/context/AuthContext";

export default function BudgetCard({ budget }: { budget: BudgetType }) {
    if (!budget) return null;

    const [isEnabled, setIsEnabled] = useState(budget.enabled);
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(budget.description);
    const [currentAmount, setCurrentAmount] = useState(budget.currentAmount ?? 0);
    const [maxAmount, setMaxAmount] = useState(budget.maxAmount ?? 1);
    const [targetPeriod, setTargetPeriod] = useState<TargetPeriod>(budget.targetPeriod);

    const [withdrawAmount, setWithdrawAmount] = useState<string>("");

    const TARGET_PERIODS = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
    const { currentUser } = useContext(AuthContext);

    async function handleEnableToggle() {
        if ((currentUser != null) && budget != null) {
            const nextEnabled = !isEnabled;
            setIsEnabled(nextEnabled);
            await updateBudget(currentUser.token,
                {
                    id: budget.id,
                    user: budget.user,
                    description: description,
                    enabled: nextEnabled,
                    currentAmount: currentAmount,
                    maxAmount: maxAmount,
                    targetPeriod: targetPeriod
                });
        }
        else {
            console.log("Null values: update was rejected");
        }
    }

    async function handleWithdraw() {
        if ((currentUser != null) && budget != null) {
            const amount = parseFloat(withdrawAmount);
            if (isNaN(amount) || amount <= 0) {
                console.log("Invalid withdrawal amount entered");
                return;
            }

            try {
                const transactionData = {
                    budget: { id: budget.id },
                    transactionType: TransactionType.BUDGET_WITHDRAWL,
                    amount: amount,
                    description: `Withdrawal from ${description || `Budget #${budget.id}`}`,
                    recurrence: false
                };

                await createTransaction(currentUser.token, transactionData);

                const newCurrentAmount = currentAmount - amount;

                await updateBudget(currentUser.token,
                    {
                        id: budget.id,
                        user: budget.user,
                        description: description,
                        enabled: budget.enabled,
                        currentAmount: newCurrentAmount,
                        maxAmount: maxAmount,
                        targetPeriod: targetPeriod
                    });

                setCurrentAmount(newCurrentAmount);
                setWithdrawAmount("");
            } catch (err) {
                console.error("Failed to create withdrawal transaction:", err);
                alert("Failed to process withdrawal transaction.");
            }
        }
        else {
            console.log("Null values: update was rejected");
        }
    }

    async function handleEdit() {
        if (isEditing) {
            if ((currentUser != null) && budget != null) {
                let updatedDescription = description;
                if (!updatedDescription.endsWith(' Jet')) {
                    updatedDescription = updatedDescription + ' Jet';
                    setDescription(updatedDescription);
                }

                await updateBudget(currentUser.token,
                    {
                        id: budget.id,
                        user: budget.user,
                        description: updatedDescription,
                        enabled: budget.enabled,
                        currentAmount: currentAmount,
                        maxAmount: maxAmount,
                        targetPeriod: targetPeriod
                    });
            }
            else {
                console.log("Null values: update was rejected");
            }
        }
        setIsEditing(!isEditing);
    }

    const percentage = (currentAmount / maxAmount) * 100;

    let textColor = "text-green-400";
    if (percentage >= 90) {
        textColor = "text-green-400";
    } else if (percentage >= 75) {
        textColor = "text-yellow-300";
    }
    else {
        textColor = "text-red-400";
    }

    return (
        <div className={`w-full p-3 border rounded-lg shadow-sm flex flex-col gap-2 transition-colors ${isEnabled
            ? "bg-sky-600 text-slate-200"
            : "bg-slate-600 text-sky-400 border-slate-300"
            }`}>
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-0.5">
                    <div>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={!isEditing}
                            className={`font-semibold text-base bg-transparent border-2 rounded px-1 transition-colors ${isEditing ? "border-white bg-sky-700 text-white" : "border-transparent cursor-default"
                                }`}
                        />
                    </div>

                    <div className="flex items-center gap-1 text-xs mt-0.5">
                        <span className="font-bold">$</span>
                        <input
                            type="number"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(Number(e.target.value))}
                            disabled={!isEditing}
                            style={{ width: `${Math.max(maxAmount.toString().length + 4, 8)}ch` }}
                            className={`bg-transparent border-2 rounded px-1 font-bold text-center transition-colors min-w-20 ${isEditing ? "border-white bg-sky-700 text-white" : "border-transparent cursor-default"
                                }`}
                        />
                        <span className="text-sky-200">/</span>
                        <select
                            value={targetPeriod}
                            onChange={(e) => setTargetPeriod(e.target.value as TargetPeriod)}
                            disabled={!isEditing}
                            className={`bg-transparent border-2 rounded px-1 text-xs transition-colors ${isEditing ? "border-white bg-sky-700 text-white cursor-pointer" : "border-transparent cursor-default appearance-none"
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

                <div className={`flex items-center gap-1 text-2xl font-extrabold mr-6 ${textColor}`}>
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
                <div className="flex gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <input
                            type="number"
                            placeholder="Amount"
                            value={withdrawAmount}
                            disabled={isEditing}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white w-28"
                        />
                        <button
                            onClick={handleWithdraw}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Withdraw
                        </button>
                    </div>

                    <button
                        onClick={handleEnableToggle}
                        className="h-14 w-14 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                    >
                        {isEnabled ? "Disable" : "Enable"}
                    </button>
                </div>

                <button
                    onClick={handleEdit}
                    className={`px-3 py-1 text-xs font-medium rounded text-white transition-colors mr-6 h-6.5 ${isEditing
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