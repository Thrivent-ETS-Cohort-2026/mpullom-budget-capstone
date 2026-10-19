const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface AccountTransferData {
    sourceAccountNumber: number;
    targetAccountNumber: number;
    amount: number;
    description: string;
    timestamp?: string;
}

export async function createAccountTransfer(token: string, transferData: AccountTransferData) {
    const response = await fetch(`${API_BASE_URL}/transfers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(transferData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to process account transfer");
    }

    return response.json();
}