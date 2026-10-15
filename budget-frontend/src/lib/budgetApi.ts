import { BudgetType} from "@/types/DataTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/budgets';

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
