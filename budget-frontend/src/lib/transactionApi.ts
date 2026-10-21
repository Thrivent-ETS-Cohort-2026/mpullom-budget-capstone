import { Transaction } from "@/types/DataTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/transactions';

export async function getTransactions(token: string, fromDate?: string, toDate?: string) {
    let url = `${BASE_URL}`;
    const params = new URLSearchParams();

    if (fromDate) {
        const formattedFrom = fromDate.includes('T') ? fromDate : `${fromDate}T00:00:00`;
        params.append("fromDate", formattedFrom);
    }

    if (toDate) {
        const formattedTo = toDate.includes('T') ? toDate : `${toDate}T23:59:59`;
        params.append("toDate", formattedTo);
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch transactions");
    }

    return response.json();
}


export async function createTransaction(token: string, transactionData: {
    account?: { accountNumber: number };
    budget?: { id: number };
    transactionType: string;
    amount: number;
    recurrencePeriod: number;
    description: string;
    timestamp?: string;
}): Promise<Transaction> {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transactionData)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to create transaction: ${errorBody}`);
    }

    return response.json();
}

export async function deleteTransaction(token: string, transactionId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${transactionId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to delete transaction: ${errorBody}`);
    }
}

export async function updateTransaction(token: string, transactionId: number, updatedTransaction: any) {
    const response = await fetch(`${BASE_URL}/${transactionId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedTransaction)
    });
    if (!response.ok) throw new Error("Failed to update transaction");
    return response.json();
}