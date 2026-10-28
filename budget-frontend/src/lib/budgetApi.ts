import { BudgetTallyResponse, BudgetType, User } from "@/types/DataTypes";
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/budgets`;

export async function fetchBudgets(token: string): Promise<BudgetType[]> {
    const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch budgets");
    }

    return response.json();
}

export async function updateBudget(token: string, changes: BudgetType): Promise<void> {
    try {
        const response = await fetch(`${BASE_URL}/${changes.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(changes)
        });

        if (!response.ok) {
            throw new Error("Update request failed.");
        }
    } catch (error: any) {
        throw new Error(error.message || "An unexpected error occurred.");
    }
}

export async function createBudget(user: User, budgetData?: Partial<BudgetType>): Promise<void> {
    try {
        const cleanTimestamp = (isoString?: string) => {
            if (!isoString) return new Date().toISOString().split('.')[0];
            return isoString.split('.')[0].replace('Z', '');
        };

        const payload = {
            user: user, 
            description: budgetData?.description ?? "New Budget",
            targetPeriod: budgetData?.targetPeriod ?? "MONTHLY",
            category: budgetData?.category ?? "FOOD",
            currentAmount: budgetData?.currentAmount ?? 0,
            maxAmount: budgetData?.maxAmount ?? 100,
            enabled: budgetData?.enabled ?? true,
            startDate: cleanTimestamp(budgetData?.startDate)
        };

        const response = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to create budget.");
        }
    } catch (error: any) {
        throw new Error(error.message || "An unexpected error occurred.");
    }
}

export async function deleteBudget(token: string, budgetId: number): Promise<void> {
    try {
        const response = await fetch(`${BASE_URL}/${budgetId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Backend delete failed [Status ${response.status}]:`, errorBody);
            throw new Error(`Failed to delete budget: ${response.statusText} (${errorBody})`);
        }
    } catch (error) {
        console.error("Network or execution error during deleteBudget:", error);
        throw error;
    }
}

export async function tallyBudgets(token: string, startDate: string, endDate: string): Promise<BudgetTallyResponse> {
    try {
        const response = await fetch(`${BASE_URL}/tally`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ startDate, endDate })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to tally budget amounts.");
        }

        return response.json();
    } catch (error: any) {
        throw new Error(error.message || "An unexpected error occurred during budget tallying.");
    }
}

export async function tallyBudgetCategoryTransactions(
    token: string, 
    budgetId: number, 
    startDate: string, 
    endDate: string
): Promise<BudgetTallyResponse> {
    try {
        const response = await fetch(`${BASE_URL}/${budgetId}/tally`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ startDate, endDate })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to tally category budget amounts.");
        }

        return response.json();
    } catch (error: any) {
        throw new Error(error.message || "An unexpected error occurred during category budget tallying.");
    }
}