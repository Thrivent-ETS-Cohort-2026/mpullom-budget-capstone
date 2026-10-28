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

export async function createAccount(token: string, accountData: { accountType: string; balance: number; accountStatus: string }): Promise<Account> {
    try {
        const response = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(accountData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to create account.");
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(error.message || "An unexpected error occurred.");
    }
}

export async function updateAccount(token: string, accountNumber: number, accountData: { accountType: string; balance: number; accountStatus: string }): Promise<Account> {
    try {
        const response = await fetch(`${BASE_URL}/${accountNumber}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(accountData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to update account.");
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(error.message || "An unexpected error occurred.");
    }
}

export async function updateAccountBalance(token: string, acctNo: number, newBalance: number): Promise<Account> {
    try {
        const response = await fetch(`${BASE_URL}/${acctNo}/balance?newBalance=${newBalance}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to update account balance.");
        }
        return await response.json();
    } catch (error: any) {
        throw new Error(error.message || "An unexpected error occurred.");
    }
}