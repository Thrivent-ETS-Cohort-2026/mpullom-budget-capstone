'use client'

import { useContext, useState, useEffect } from "react";
import { Account, BudgetType, TransactionType } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { updateAccountBalance, fetchAccounts } from "@/lib/accountApi";
import { fetchBudgets } from "@/lib/budgetApi";
import { createTransaction } from "@/lib/transactionApi";
import Notification from "@/components/Notification";
import { createAccountTransfer, createBudgetTransfer } from "@/lib/transferApi";

interface AccountCardProps {
    account: Account;
    onAccountUpdated?: () => void;
}

export default function AccountCard({ account, onAccountUpdated }: AccountCardProps) {
    if (!account) return null;

    const [currentBalance, setCurrentBalance] = useState(account.balance ?? 0);

    const [depositAmount, setDepositAmount] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");
    const [transferAmount, setTransferAmount] = useState<string>("");
    const [accountTransferAmount, setAccountTransferAmount] = useState<string>("");

    const [selectedAccountBudget, setSelectedAccountBudget] = useState<string>("");
    const [selectedTargetAccount, setSelectedTargetAccount] = useState<string>("");
    const [notificationMessage, setNotificationMessage] = useState<string>("");

    const [allAccounts, setAllAccounts] = useState<Account[]>([]);
    const [allBudgets, setAllBudgets] = useState<BudgetType[]>([]);

    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        setCurrentBalance(account.balance ?? 0);
    }, [account.balance]);

    useEffect(() => {
        async function loadTransferTargets() {
            if (currentUser?.token != null) {
                try {
                    const [accountsData, budgetsData] = await Promise.all([
                        fetchAccounts(currentUser.token),
                        fetchBudgets(currentUser.token)
                    ]);

                    setAllAccounts(accountsData.filter(acc => acc.accountNumber !== account.accountNumber));
                    setAllBudgets(budgetsData);
                } catch (err) {
                    console.error("Failed to load transfer targets:", err);
                }
            }
        }
        loadTransferTargets();
    }, [currentUser?.token, account.accountNumber]);

    async function handleBalanceChange(isDeposit: boolean) {
        if (currentUser != null && account != null) {
            if (!isDeposit && !selectedAccountBudget) {
                setNotificationMessage("Please select a budget from the dropdown above before submitting this withdrawal.");
                return;
            }

            const rawAmount = isDeposit ? depositAmount : withdrawAmount;
            const amount = parseFloat(rawAmount);

            if (isNaN(amount) || amount <= 0) {
                setNotificationMessage("Invalid amount entered.");
                return;
            }

            try {
                const transactionType = isDeposit ? TransactionType.ACCOUNT_DEPOSIT : TransactionType.ACCOUNT_WITHDRAWL;
                const transactionData: any = {
                    account: account,
                    transactionType: transactionType,
                    amount: amount,
                    description: `${isDeposit ? "Deposit to" : "Withdrawal from"} Account #${account.accountNumber}`,
                    recurrencePeriod: 0
                };

                if (!isDeposit && selectedAccountBudget) {
                    transactionData.budget = { id: Number(selectedAccountBudget) };
                }

                await createTransaction(currentUser.token, transactionData);

                const newBalance = isDeposit
                    ? currentBalance + amount
                    : currentBalance - amount;

                await updateAccountBalance(currentUser.token, account.accountNumber, newBalance);

                setCurrentBalance(newBalance);
                setNotificationMessage(`Successfully processed ${isDeposit ? "deposit" : "withdrawal"}!`);

                if (isDeposit) {
                    setDepositAmount("");
                } else {
                    setWithdrawAmount("");
                }

                onAccountUpdated?.();
            } catch (err) {
                console.error(`Failed to process ${isDeposit ? "deposit" : "withdrawal"} transaction:`, err);
                setNotificationMessage(`Failed to process ${isDeposit ? "deposit" : "withdrawal"}. Check balance and account status.`);
            }
        } else {
            console.log("Null values: update was rejected");
        }
    }

    async function handleTransfer() {
        if (currentUser != null && account != null) {
            if (!selectedAccountBudget) {
                setNotificationMessage("Please select a budget from the dropdown above before submitting this transaction.");
                return;
            }

            const amount = parseFloat(transferAmount);
            if (isNaN(amount) || amount <= 0) {
                setNotificationMessage("Invalid transfer amount entered.");
                return;
            }

            const targetBudgetObj = allBudgets.find(b => b.id === Number(selectedAccountBudget));
            if (!targetBudgetObj) {
                setNotificationMessage("Selected budget not found.");
                return;
            }

            try {
                await createBudgetTransfer(currentUser.token, {
                    sourceAccount: account,
                    targetBudget: targetBudgetObj,
                    amount: amount,
                    description: `Transfer from Account #${account.accountNumber} using Budget #${selectedAccountBudget}`
                });

                const newBalance = currentBalance - amount;

                await updateAccountBalance(currentUser.token, account.accountNumber, newBalance);

                setCurrentBalance(newBalance);
                setTransferAmount("");
                setNotificationMessage("Successfully processed budget transfer!");
                onAccountUpdated?.();
            } catch (err) {
                console.error("Failed to process transfer:", err);
                setNotificationMessage("Failed to process budget transfer transaction.");
            }
        } else {
            console.log("Null values: update was rejected");
        }
    }

    async function handleAccountTransfer() {
        if (currentUser != null && account != null) {
            if (!selectedTargetAccount) {
                setNotificationMessage("Please select a target account for the transfer.");
                return;
            }

            const amount = parseFloat(accountTransferAmount);
            if (isNaN(amount) || amount <= 0) {
                setNotificationMessage("Invalid account transfer amount entered.");
                return;
            }

            if (amount > currentBalance) {
                setNotificationMessage("Insufficient funds for account transfer.");
                return;
            }

            const targetAccObj = allAccounts.find(acc => acc.accountNumber === Number(selectedTargetAccount));
            if (!targetAccObj) {
                setNotificationMessage("Target account not found.");
                return;
            }

            try {
                await createAccountTransfer(currentUser.token, {
                    sourceAccount: account,
                    targetAccount: targetAccObj,
                    amount: amount,
                    description: `Transfer from Account #${account.accountNumber} to Account #${selectedTargetAccount}`
                });

                const newSourceBalance = currentBalance - amount;

                setCurrentBalance(newSourceBalance);
                setAccountTransferAmount("");
                setSelectedTargetAccount("");
                setNotificationMessage("Successfully transferred funds to account!");
                onAccountUpdated?.();
            } catch (err) {
                console.error("Failed to process account-to-account transfer:", err);
                setNotificationMessage("Failed to process account-to-account transfer.");
            }
        } else {
            console.log("Null values: update was rejected");
        }
    }

    const isDepositTyping = depositAmount.length > 0;
    const isWithdrawTyping = withdrawAmount.length > 0;
    const isTransferTyping = transferAmount.length > 0;
    const isAccountTransferTyping = accountTransferAmount.length > 0;

    return (
        <div className={`w-full p-3 border rounded-lg shadow-sm flex flex-col gap-3 transition-colors 
        bg-sky-600 text-slate-200 relative`}>

            <Notification
                message={notificationMessage}
                onClose={() => setNotificationMessage("")}
            />

            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-0.5">
                    <div>
                        {account.accountType + " Bud #" + account.accountNumber}
                    </div>
                </div>

                <div className="text-3xl font-bold mr-6 text-emerald-400">
                    Balance: ${currentBalance.toFixed(2)}
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-1">
                <div className="grid grid-cols-4 gap-3 w-full items-end">

                    <div></div>

                    <div className="col-span-2 flex flex-col gap-1 w-full">
                        <label className="text-xs font-medium text-sky-200">Associated Budget</label>
                        <select
                            value={selectedAccountBudget}
                            onChange={(e) => setSelectedAccountBudget(e.target.value)}
                            className="px-2 py-1.5 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white w-full"
                        >
                            <option value="" disabled>Select Associated Budget</option>
                            {allBudgets.map(b => (
                                <option key={`account-budget-${b.id}`} value={b.id}>
                                    {b.description || `Budget #${b.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-medium text-sky-200 truncate">Target Account</label>
                        <select
                            value={selectedTargetAccount}
                            onChange={(e) => setSelectedTargetAccount(e.target.value)}
                            disabled={isDepositTyping || isWithdrawTyping || isTransferTyping}
                            className="px-2 py-1.5 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full"
                        >
                            <option value="" disabled>Select Account</option>
                            {allAccounts.map(acc => (
                                <option key={`target-acc-${acc.accountNumber}`} value={acc.accountNumber}>
                                    {acc.accountType} (#{acc.accountNumber})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="number"
                            placeholder="Deposit Amount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            disabled={isWithdrawTyping || isTransferTyping || isAccountTransferTyping}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full"
                        />
                        <button
                            onClick={() => handleBalanceChange(true)}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors w-full"
                        >
                            Deposit
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="number"
                            placeholder="Withdraw Amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            disabled={isDepositTyping || isTransferTyping || isAccountTransferTyping}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full"
                        />
                        <button
                            onClick={() => handleBalanceChange(false)}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors w-full"
                        >
                            Withdraw
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="number"
                            placeholder="Fund Amount"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            disabled={isDepositTyping || isWithdrawTyping || isAccountTransferTyping}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full"
                        />
                        <button
                            onClick={handleTransfer}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors w-full"
                        >
                            Fund Budget
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="number"
                            placeholder="Transfer Amount"
                            value={accountTransferAmount}
                            onChange={(e) => setAccountTransferAmount(e.target.value)}
                            disabled={isDepositTyping || isWithdrawTyping || isTransferTyping}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full"
                        />
                        <button
                            onClick={handleAccountTransfer}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors w-full"
                        >
                            Transfer
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}