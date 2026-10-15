import { BudgetType, User, UserRequest } from "@/types/DataTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function fetchBudgets(token: string): Promise<BudgetType[]> {
  const response = await fetch(`${BASE_URL}/budgets`, {
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