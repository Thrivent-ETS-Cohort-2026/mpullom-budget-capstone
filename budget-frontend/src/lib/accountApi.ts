import { Account } from "@/types/DataTypes";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/accounts`;

export async function fetchAccounts(token: string): Promise<Account[]> {
  const response = await fetch(`${BASE_URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }

  return response.json();
}