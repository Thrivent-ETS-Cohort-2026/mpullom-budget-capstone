const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function getTransactions(token: string, fromDate?: string, toDate?: string) {
    let url = `${BASE_URL}/transactions`;
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

export async function getAccounts(token: string) {
    const response = await fetch(`${BASE_URL}/accounts`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch accounts");
    }
    return response.json();
}

export async function getBudgets(token: string) {
    const response = await fetch(`${BASE_URL}/budgets`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch budgets");
    }
    return response.json();
}

export async function createTransaction(token: string, transactionData: {
    account?: { accountNumber: number };
    budget: { id: number };
    transactionType: string;
    amount: number;
    recurrence: boolean;
    description: string;
    timestamp?: string;
}) {
    const response = await fetch(`${BASE_URL}/transactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend validation error:", errorText);
        throw new Error(`Failed to create transaction: ${errorText}`);
    }

    return response.json();
}

export async function deleteTransaction(token: string, transactionId: number) {
    const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to delete transaction");
}

export async function updateTransaction(token: string, transactionId: number, updatedTransaction: any) {
    const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
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