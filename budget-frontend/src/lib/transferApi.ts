import { Account } from "@/types/DataTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function createAccountTransfer(token: string, transferData: {
    sourceAccount: Account;
    targetAccount: Account;
    amount: number;
    description?: string;
    timestamp?: string;
}) {
    const res = await fetch(`${API_BASE_URL}/transactions/transfer/account`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        body: JSON.stringify(transferData),
    });

    if (!res.ok) {
        throw new Error("Failed to process account-to-account transfer.");
    }
}

export async function createBudgetTransfer(token: string, transferData: {
    sourceAccount: Account;
    targetBudget: { id: number };
    amount: number;
    description?: string;
    timestamp?: string;
}) {
    const res = await fetch(`${API_BASE_URL}/transactions/transfer/budget`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        body: JSON.stringify(transferData),
    });

    if (!res.ok) {
        throw new Error("Failed to process budget transfer.");
    }
}