import { BudgetType } from "@/types/DataTypes";

export default function BudgetCard({ budget }: { budget: BudgetType }) {
    if (!budget) return null;

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-sky-600">
            <h2 className="font-semibold text-lg">{budget.description}</h2>
            <div className="flex items-center gap-1 text-sm mt-0.5">
                <span className="text-green-600 font-bold">
                    ${(budget.currentAmount ?? 0).toFixed(2)}
                </span>
                <span className="text-gray-700">/{budget.targetPeriod}</span>
            </div>
        </div>
    );
}