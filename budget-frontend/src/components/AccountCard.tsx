'use client'

import { useContext, useState, useEffect } from "react";
import { Account, Category, TransactionType } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { updateAccountBalance } from "@/lib/accountApi";
import { createTransaction } from "@/lib/transactionApi";
import Notification from "@/components/Notification";
import { createAccountTransfer } from "@/lib/transferApi";

interface AccountCardProps {
    account: Account;
    allAccounts: Account[];
    onAccountUpdated?: () => void;
    onEditAccount?: () => void;
}

export default function AccountCard({ account, allAccounts, onAccountUpdated, onEditAccount }: AccountCardProps) {
    if (!account) return null;

    const [currentBalance, setCurrentBalance] = useState(account.balance ?? 0);

    const [depositAmount, setDepositAmount] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");
    const [accountTransferAmount, setAccountTransferAmount] = useState<string>("");

    const [selectedCategory, setSelectedCategory] = useState<Category>(Category.FOOD);
    const [selectedTargetAccount, setSelectedTargetAccount] = useState<string>("");
    const [notificationMessage, setNotificationMessage] = useState<string>("");

    const CATEGORIES = Object.values(Category);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        setCurrentBalance(account.balance ?? 0);
    }, [account.balance]);

    async function handleBalanceChange(isDeposit: boolean) {
        if (currentUser != null && account != null) {
            const rawAmount = isDeposit ? depositAmount : withdrawAmount;
            const amount = parseFloat(rawAmount);

            if (isNaN(amount) || amount <= 0) {
                setNotificationMessage("Invalid amount entered.");
                return;
            }

            try {
                const transactionType = isDeposit ? TransactionType.ACCOUNT_DEPOSIT : TransactionType.ACCOUNT_WITHDRAWAL;
                const transactionData = {
                    account: account,
                    transactionType: transactionType,
                    amount: amount,
                    description: `${isDeposit ? "Deposit to" : "Withdrawal from"} Account #${account.accountNumber}`,
                    recurrencePeriod: 0,
                    category: isDeposit ? Category.BILLS : selectedCategory
                };

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
        }
    }

    const isDepositTyping = depositAmount.length > 0;
    const isWithdrawTyping = withdrawAmount.length > 0;
    const isAccountTransferTyping = accountTransferAmount.length > 0;

    const targetAccountOptions = allAccounts.filter(acc => acc && acc.accountNumber !== account.accountNumber);

    return (
        <div className="w-full p-3 border rounded-lg shadow-sm flex flex-col gap-3 transition-colors bg-sky-600 text-slate-200 relative">

            <Notification
                message={notificationMessage}
                onClose={() => setNotificationMessage("")}
            />

            <div className="flex justify-between items-start w-full">
                <div className="flex flex-col gap-1">
                    <div className="font-semibold text-lg">
                        {account.accountType + " Account #" + account.accountNumber}
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                        Balance: ${currentBalance.toFixed(2)}
                    </div>
                </div>

                <button
                    onClick={() => onEditAccount?.()}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors shadow-sm cursor-pointer"
                >
                    Edit
                </button> 
            </div>

            <div className="flex flex-col gap-2 mt-1">
                <div className="grid grid-cols-3 gap-3 w-full items-end">

                    <div className="flex flex-col gap-1">
                        <input
                            type="number"
                            placeholder="Deposit Amount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            disabled={isWithdrawTyping || isAccountTransferTyping}
                            className="px-2 py-1.5 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full"
                        />
                        <button
                            onClick={() => handleBalanceChange(true)}
                            className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors w-full shadow-sm cursor-pointer"
                        >
                            Deposit
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-medium text-sky-200">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as unknown as Category)}
                            className="px-2 py-1.5 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white w-full cursor-pointer"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={`category-${cat}`} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Withdraw Amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            disabled={isDepositTyping || isAccountTransferTyping}
                            className="px-2 py-1.5 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full mt-1"
                        />
                        <button
                            onClick={() => handleBalanceChange(false)}
                            className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors w-full shadow-sm cursor-pointer"
                        >
                            Withdraw
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-medium text-sky-200 truncate">Target Account</label>
                        <select
                            value={selectedTargetAccount}
                            onChange={(e) => setSelectedTargetAccount(e.target.value)}
                            disabled={isDepositTyping || isWithdrawTyping}
                            className="px-2 py-1.5 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full cursor-pointer"
                        >
                            <option value="" disabled>Select Target Account</option>
                            {targetAccountOptions.map(acc => (
                                <option key={`target-acc-${acc.accountNumber}`} value={acc.accountNumber}>
                                    {acc.accountType} (#{acc.accountNumber})
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Transfer Amount"
                            value={accountTransferAmount}
                            onChange={(e) => setAccountTransferAmount(e.target.value)}
                            disabled={isDepositTyping || isWithdrawTyping}
                            className="px-2 py-1.5 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 w-full mt-1"
                        />
                        <button
                            onClick={handleAccountTransfer}
                            className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors w-full shadow-sm cursor-pointer"
                        >
                            Transfer
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}