'use client'

import { useState, useEffect, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Transaction, BudgetType, Account, TransactionType } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { getTransactions, createTransaction } from "@/lib/transactionApi";
import { fetchAccounts } from "@/lib/accountApi";
import TransactionCard from "./TransactionCard";
import CsvDownloader from "./CsvDownloader";
import TransactionFilter from "./TransactionFilter";
import Notification from "./Notification";
import { fetchBudgets } from "@/lib/budgetApi";

export default function TransactionList() {
    const router = useRouter();
    const pathname = usePathname();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [notificationMessage, setNotificationMessage] = useState<string>("");

    const [submittedFrom, setSubmittedFrom] = useState<string>("");
    const [submittedTo, setSubmittedTo] = useState<string>("");

    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [budgets, setBudgets] = useState<BudgetType[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);

    const [budgetId, setBudgetId] = useState<number>(0);
    const [accountNumber, setAccountNumber] = useState<number>(0);
    const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.ACCOUNT_DEPOSIT);
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    
    const [recurrencePeriod, setRecurrencePeriod] = useState<number>(0);

    const [transactionDate, setTransactionDate] = useState<string>("");
    const [transactionTime, setTransactionTime] = useState<string>("");

    const { currentUser } = useContext(AuthContext);

    const isBankingRoute = pathname === '/banking/transactions';
    const isBudgetingRoute = pathname === '/budgeting/transactions';

    const requiresBudget = transactionType === TransactionType.ACCOUNT_WITHDRAWL || transactionType === TransactionType.BUDGET_DEPOSIT;

    async function fetchTransactionsList() {
        if (!currentUser) return;
        try {
            const data = await getTransactions(currentUser.token, submittedFrom, submittedTo);
            setTransactions(data);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser != null) {
            fetchTransactionsList();
        } else {
            setLoading(false);
        }
    }, [currentUser, submittedFrom, submittedTo]);

    useEffect(() => {
        async function loadCreationData() {
            if (isCreating && currentUser) {
                try {
                    const [budgetsData, accountsData] = await Promise.all([
                        fetchBudgets(currentUser.token),
                        fetchAccounts(currentUser.token)
                    ]);
                    setBudgets(budgetsData);
                    setAccounts(accountsData);

                    if (accountsData.length > 0 && accountNumber === 0) {
                        setAccountNumber(accountsData[0].accountNumber);
                    }
                } catch (err) {
                    console.error("Failed to load creation data:", err);
                }
            }
        }

        loadCreationData();
    }, [isCreating, currentUser]);

    function handleFilterSearch(fromDate: string, toDate: string) {
        if (fromDate && toDate && fromDate > toDate) {
            setNotificationMessage("Start date cannot be ahead of the end date.");
            return;
        }

        setSubmittedFrom(fromDate);
        setSubmittedTo(toDate);
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser) return;

        let selectedBudget: BudgetType | undefined = undefined;

        if (requiresBudget) {
            if (!budgetId || budgetId === 0) {
                setNotificationMessage("Please select a budget from the dropdown above before submitting this transaction.");
                return;
            }

            selectedBudget = budgets.find(b => b.id === Number(budgetId));
            if (selectedBudget && selectedBudget.enabled === false) {
                setNotificationMessage("Cannot create a transaction for a disabled budget.");
                return;
            }
        }

        if (transactionType !== TransactionType.BUDGET_WITHDRAWL && (!accountNumber || accountNumber === 0)) {
            setNotificationMessage("Please select a valid account.");
            return;
        }

        try {
            let formattedTimestamp: string | undefined = undefined;
            if (transactionDate) {
                const timePart = transactionTime ? (transactionTime.length === 5 ? `${transactionTime}:00` : transactionTime) : "00:00:00";
                formattedTimestamp = `${transactionDate}T${timePart}`;
            }

            let finalDescription = description ? description.trim() : "";
            if (requiresBudget && selectedBudget) {
                const budgetIdentifier = selectedBudget.description || `Budget #${selectedBudget.id}`;
                const defaultPrefix = transactionType === TransactionType.BUDGET_DEPOSIT 
                    ? `Deposit to Budget #${selectedBudget.id}` 
                    : `Withdrawal from Account #${accountNumber}[${budgetIdentifier}]`;

                finalDescription = finalDescription ? finalDescription : defaultPrefix;
            } else if (!requiresBudget && accountNumber > 0) {
                const defaultPrefix = transactionType === TransactionType.ACCOUNT_DEPOSIT 
                    ? `Deposit to Account #${accountNumber}` 
                    : `Withdrawal from Account #${accountNumber}`;
                finalDescription = finalDescription ? finalDescription : defaultPrefix;
            }

            const transactionData: any = {
                transactionType,
                amount: parseFloat(amount) || 0,
                recurrencePeriod: Number(recurrencePeriod) || 0,
                description: finalDescription,
                timestamp: formattedTimestamp
            };

            if (requiresBudget) {
                transactionData.budget = { id: Number(budgetId) };
            }

            if (transactionType !== TransactionType.BUDGET_WITHDRAWL) {
                transactionData.account = { accountNumber: Number(accountNumber) };
            }

            await createTransaction(currentUser.token, transactionData);

            setIsCreating(false);
            setAmount("");
            setDescription("");
            setRecurrencePeriod(0);
            setBudgetId(0);
            setAccountNumber(accounts.length > 0 ? accounts[0].accountNumber : 0);
            setTransactionDate("");
            setTransactionTime("");

            await fetchTransactionsList();
        } catch (err: any) {
            console.error("Failed to create transaction:", err);

            let errorMsg = "Failed to create transaction. Check if the budget is active and funds are sufficient.";
            if (err instanceof Error) {
                errorMsg = err.message;
            } else if (typeof err === "string") {
                errorMsg = err;
            }

            setNotificationMessage(errorMsg);
        }
    }

    if (loading) {
        return <main className="p-4">Loading transactions...</main>;
    }

    return (
        <main className="p-4 w-full relative">
            <Notification
                message={notificationMessage}
                onClose={() => setNotificationMessage("")}
            />

            <div className="flex justify-between items-center w-full mb-4">
                <h1 className="text-2xl font-bold">Transactions</h1>
                <div className="flex items-center gap-2">
                    <CsvDownloader transactions={transactions} />
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className={`px-4 py-2 text-sm font-medium rounded text-white transition-colors ${
                            isCreating
                                ? "bg-rose-800 hover:bg-rose-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                        {isCreating ? "Cancel" : "Create Transaction"}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-sm font-medium rounded text-white transition-colors"
                    >
                        Back
                    </button>
                </div>
            </div>

            {isCreating && (
                <form onSubmit={handleFormSubmit} className="mb-6 p-4 border rounded-lg bg-sky-800 text-slate-100 flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">New Transaction</h2>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Transaction Type</label>
                        <select
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                            className="px-2 py-1 rounded bg-sky-900 border border-sky-600 text-white"
                        >
                            {isBudgetingRoute ? (
                                <>
                                    <option value={TransactionType.BUDGET_DEPOSIT}>BUDGET_DEPOSIT</option>
                                    <option value={TransactionType.BUDGET_WITHDRAWL}>BUDGET_WITHDRAWL</option>
                                </>
                            ) : isBankingRoute ? (
                                <>
                                    <option value={TransactionType.ACCOUNT_DEPOSIT}>ACCOUNT_DEPOSIT</option>
                                    <option value={TransactionType.ACCOUNT_WITHDRAWL}>ACCOUNT_WITHDRAWL</option>
                                    <option value={TransactionType.BUDGET_DEPOSIT}>BUDGET_DEPOSIT</option>
                                </>
                            ) : (
                                <>
                                    <option value={TransactionType.ACCOUNT_DEPOSIT}>ACCOUNT_DEPOSIT</option>
                                    <option value={TransactionType.ACCOUNT_WITHDRAWL}>ACCOUNT_WITHDRAWL</option>
                                    <option value={TransactionType.BUDGET_DEPOSIT}>BUDGET_DEPOSIT</option>
                                    <option value={TransactionType.BUDGET_WITHDRAWL}>BUDGET_WITHDRAWL</option>
                                </>
                            )}
                        </select>
                    </div>

                    {transactionType !== TransactionType.BUDGET_WITHDRAWL && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">Account</label>
                            <select
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(Number(e.target.value))}
                                className="px-2 py-1 rounded bg-sky-900 border border-sky-600 text-white"
                            >
                                <option value={0} disabled>Select account</option>
                                {accounts.map(acc => (
                                    <option key={acc.accountNumber} value={acc.accountNumber}>
                                        {acc.accountType} (#{acc.accountNumber}) - ${acc.balance?.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {requiresBudget && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">Associated Budget</label>
                            <select
                                value={budgetId}
                                onChange={(e) => setBudgetId(Number(e.target.value))}
                                className="px-2 py-1 rounded bg-sky-900 border border-sky-600 text-white"
                            >
                                <option value={0} disabled>Select Associated Budget</option>
                                {budgets.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.description || `Budget #${b.id}`} {b.enabled === false ? "(Disabled)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Date & Time</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                className="px-2 py-1 rounded bg-sky-900 border border-sky-600 text-white text-sm flex-1"
                            />
                            <input
                                type="time"
                                value={transactionTime}
                                onChange={(e) => setTransactionTime(e.target.value)}
                                className="px-2 py-1 rounded bg-sky-900 border border-sky-600 text-white text-sm flex-1"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="px-2 py-1 rounded bg-sky-900 border border-sky-600 text-white"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="px-2 py-1 rounded bg-sky-900 border border-sky-600 text-white"
                            placeholder="Description"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Recurrence Period (Days)</label>
                        <input
                            type="number"
                            min="0"
                            value={recurrencePeriod}
                            onChange={(e) => setRecurrencePeriod(Number(e.target.value))}
                            className="px-2 py-1 rounded bg-sky-900 border border-sky-600 text-white"
                            placeholder="0 for non-recurring"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 font-medium rounded text-white transition-colors"
                    >
                        Create
                    </button>
                </form>
            )}

            <TransactionFilter onSearch={handleFilterSearch} />

            <div className="w-full flex flex-col gap-3 items-stretch">
                {transactions.length === 0 ? (
                    <p className="text-slate-600 font-medium">No transactions found.</p>
                ) : (
                    transactions.map((transaction, index) => (
                        <TransactionCard
                            key={transaction.transactionId ? `${transaction.transactionId}-${index}` : `fallback-key-${index}`}
                            transaction={transaction}
                            onDeleted={fetchTransactionsList}
                        />
                    ))
                )}
            </div>
        </main>
    );
}