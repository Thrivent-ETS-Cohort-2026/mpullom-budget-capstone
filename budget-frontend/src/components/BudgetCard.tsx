import { BudgetType } from "@/types/DataTypes";

export default function BudgetCard({ budget }: { budget: BudgetType }) {
    if (!budget) return null;

    function handleEnable() {}
    function handleSummary() {}
    function handleWithdraw() {}
    function handleEdit() {}

    const current = budget.currentAmount ?? 0;
    const max = budget.maxAmount ?? 1;
    const percentage = (current / max) * 100;

    let textColor = "text-green-600";
    if (percentage >= 90) {
        textColor = "text-red-600";
    } else if (percentage >= 75) {
        textColor = "text-yellow-500";
    }

    return (
        <div className={`w-full p-4 border rounded-lg shadow-sm flex flex-col gap-3 transition-colors ${
            budget.enabled
                ? "bg-sky-600 text-slate-200" 
                : "bg-slate-200 text-sky-600 border-slate-300"
        }`}>
            <div className="flex justify-between items-center w-full">
                <div>
                    <h2 className="font-semibold text-lg">{budget.description}</h2>
                    <div className="flex items-center gap-1 text-sm mt-0.5">
                        <span className="text-green-600 font-bold">
                            ${current.toFixed(2)}
                        </span>
                        <span className="text-sky-600">/{budget.targetPeriod}</span>
                    </div>
                </div>

                <div className={`text-3xl font-extrabold mr-10 ${textColor}`}>
                    ${current.toFixed(2)} /${max.toFixed(2)}
                </div>
            </div>

            <div className="flex justify-between items-center mt-1 w-full">
                <div className="flex gap-2">
                                        <button 
                        onClick={handleEnable}
                        className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-sm font-medium rounded text-white transition-colors"
                    >
                        Enable
                    </button>
                    <button 
                        onClick={handleSummary}
                        className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-sm font-medium rounded text-white transition-colors"
                    >
                        Summary
                    </button>
                    <button 
                        onClick={handleWithdraw}
                        className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-sm font-medium rounded text-white transition-colors"
                    >
                        Withdraw
                    </button>
                </div>

                <button 
                    onClick={handleEdit}
                    className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-sm font-medium rounded text-white transition-colors mr-6"
                >
                    Edit
                </button>
            </div>
        </div>
    );
}