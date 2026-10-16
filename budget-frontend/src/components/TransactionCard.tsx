import { useContext, useState, useEffect } from "react";
import { Transaction, BudgetType } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";

interface TransactionCardProps {
    transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
    if (!transaction) return null;

    const { currentUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);

    const [description, setDescription] = useState(transaction.description || "");
    const [amount, setAmount] = useState(transaction.amount?.toString() || "");
    const [recurrence, setRecurrence] = useState(transaction.recurrence || false);
    const [selectedBudgetId, setSelectedBudgetId] = useState<number>(transaction.budget?.id || 0);
    const [budgets, setBudgets] = useState<BudgetType[]>([]);

    useEffect(() => {
        if (isEditing && currentUser) {
            fetch("http://localhost:8080/api/budgets", {
                headers: {
                    "Authorization": `Bearer ${currentUser.token}`
                }
            })
                .then(res => res.json())
                .then(data => setBudgets(data))
                .catch(err => console.error("Failed to fetch budgets:", err));
        }
    }, [isEditing, currentUser]);

    async function handleDelete() {
        if (currentUser && transaction.transactionId) {
            try {
                await fetch(`http://localhost:8080/api/transactions/${transaction.transactionId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${currentUser.token}`
                    }
                });
                window.location.reload();
            } catch (err) {
                console.error("Failed to delete transaction:", err);
            }
        }
    }

    async function handleSaveEdit() {
        if (currentUser && transaction.transactionId) {
            try {
                const updatedTransaction = {
                    ...transaction,
                    description,
                    amount: parseFloat(amount) || transaction.amount,
                    recurrence,
                    budget: budgets.find(b => b.id === selectedBudgetId) || transaction.budget
                };

                await fetch(`http://localhost:8080/api/transactions/${transaction.transactionId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${currentUser.token}`
                    },
                    body: JSON.stringify(updatedTransaction)
                });

                setIsEditing(false);
                window.location.reload();
            } catch (err) {
                console.error("Failed to update transaction:", err);
            }
        }
    }

    const formattedTimestamp = transaction.timestamp
        ? new Date(transaction.timestamp).toLocaleString()
        : "";

    return (
        <div className="w-full p-3 border rounded-lg shadow-sm flex flex-col gap-3 transition-colors bg-sky-600 text-slate-200">
            {!isEditing ? (
                <>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col gap-0.5">
                            <div className="font-semibold text-lg flex items-center gap-2">
                                {transaction.transactionType}
                                {transaction.recurrence && (
                                    <span className="text-xs bg-sky-800 text-sky-200 px-1.5 py-0.5 rounded border border-sky-400">
                                        [Recurring]
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-sky-200 opacity-90">
                                {formattedTimestamp}
                            </div>
                        </div>

                        <div className="text-2xl font-bold mr-2 text-green-400">
                            ${transaction.amount?.toFixed(2)}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 text-sm bg-sky-700/50 p-2 rounded">
                        <div><span className="font-medium text-sky-300">Desc:</span> {transaction.description}</div>
                        {transaction.budget && (
                            <div className="text-xs text-sky-200">
                                <span className="font-medium text-sky-300">Budget:</span> {transaction.budget.description || `#${transaction.budget.id}`}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-2 bg-sky-700/80 p-3 rounded">
                    <div className="text-sm font-semibold text-white">Edit Transaction</div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-sky-200">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-sky-200">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-sky-200">Budget</label>
                        <select
                            value={selectedBudgetId}
                            onChange={(e) => setSelectedBudgetId(Number(e.target.value))}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none"
                        >
                            <option value={0} disabled>Select a budget</option>
                            {budgets.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.description ? `${b.description}` : `Budget #${b.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <input
                            type="checkbox"
                            id={`recurrence-${transaction.transactionId}`}
                            checked={recurrence}
                            onChange={(e) => setRecurrence(e.target.checked)}
                            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-sky-900 border-sky-500"
                        />
                        <label htmlFor={`recurrence-${transaction.transactionId}`} className="text-xs text-sky-200 select-none">
                            Recurring
                        </label>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-1 border-t border-sky-500/40">
                {!isEditing ? (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Delete
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}