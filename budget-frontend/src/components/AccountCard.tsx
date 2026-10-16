import { useContext, useState, useEffect } from "react";
import { Account, BudgetType, TransactionType } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { updateAccountBalance, fetchAccounts } from "@/lib/accountApi";
import { fetchBudgets } from "@/lib/budgetApi";
import { createTransaction } from "@/lib/transactionApi";
import { useRouter } from "next/navigation";

export default function AccountCard({ account }: { account: Account }) {
    if (!account) return null;

    const [currentBalance, setCurrentBalance] = useState(account.balance ?? 0);
    
    const [depositAmount, setDepositAmount] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");
    
    const [transferAmount, setTransferAmount] = useState<string>("");
    const [selectedTarget, setSelectedTarget] = useState<string>(""); 
    const [allAccounts, setAllAccounts] = useState<Account[]>([]);
    const [allBudgets, setAllBudgets] = useState<BudgetType[]>([]);

    const { currentUser } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        async function loadTransferTargets() {
            if (currentUser != null) {
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
    }, [currentUser, account.accountNumber]);

    async function handleBalanceChange(isDeposit: boolean) {
        if (currentUser != null && account != null) {
            const rawAmount = isDeposit ? depositAmount : withdrawAmount;
            const amount = parseFloat(rawAmount);

            if (isNaN(amount) || amount <= 0) {
                console.log("Invalid amount entered");
                return;
            }

            try {
                const transactionType = isDeposit ? TransactionType.ACCOUNT_DEPOSIT : TransactionType.ACCOUNT_WITHDRAWL;
                const transactionData = {
                    account: { accountNumber: account.accountNumber },
                    budget: { id: 0 },
                    transactionType: transactionType,
                    amount: amount,
                    description: `${isDeposit ? "Deposit to" : "Withdrawal from"} Account #${account.accountNumber}`,
                    recurrence: false
                };

                await createTransaction(currentUser.token, transactionData);

                const newBalance = isDeposit 
                    ? currentBalance + amount 
                    : currentBalance - amount;

                await updateAccountBalance(currentUser.token, account.accountNumber, newBalance);
                
                setCurrentBalance(newBalance);
                if (isDeposit) {
                    setDepositAmount("");
                } else {
                    setWithdrawAmount("");
                }
            } catch (err) {
                console.error(`Failed to process ${isDeposit ? "deposit" : "withdrawal"} transaction:`, err);
                alert(`Failed to process ${isDeposit ? "deposit" : "withdrawal"}. Check balance and account status.`);
            }
        } else {
            console.log("Null values: update was rejected");
        }
    }

    async function handleTransfer() {
        if (currentUser != null && account != null) {
            const amount = parseFloat(transferAmount);
            if (isNaN(amount) || amount <= 0) {
                console.log("Invalid transfer amount entered");
                return;
            }

            if (!selectedTarget) {
                alert("Please select a target account or budget to transfer to.");
                return;
            }

            const [type, targetIdStr] = selectedTarget.split(":");
            const targetId = Number(targetIdStr);

            try {
                const isBudgetTransfer = type === "BUDGET";

                const transactionData = {
                    account: { accountNumber: account.accountNumber },
                    budget: isBudgetTransfer ? { id: targetId } : { id: 0 },
                    transactionType: isBudgetTransfer ? TransactionType.BUDGET_TRANSFER : TransactionType.BUDGET_TRANSFER,
                    amount: amount,
                    description: `Transfer from Account #${account.accountNumber} to ${isBudgetTransfer ? `Budget #${targetId}` : `Account #${targetId}`}`,
                    recurrence: false
                };

                await createTransaction(currentUser.token, transactionData);

                const newBalance = currentBalance - amount;

                await updateAccountBalance(currentUser.token, account.accountNumber, newBalance);
                
                setCurrentBalance(newBalance);
                setTransferAmount("");
                setSelectedTarget("");
            } catch (err) {
                console.error("Failed to process transfer:", err);
                alert("Failed to process transfer transaction.");
            }
        } else {
            console.log("Null values: update was rejected");
        }
    }

    return (
        <div className={`w-full p-3 border rounded-lg shadow-sm flex flex-col gap-3 transition-colors 
        bg-sky-600 text-slate-200`}>
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-0.5">
                    <div>
                        {account.accountType + " Bud #" + account.accountNumber}
                    </div>
                </div>

                <div className="text-3xl font-bold mr-6 text-green-400">
                    Balance: ${currentBalance.toFixed(2)}
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-center w-full gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                        <input
                            type="number"
                            placeholder="Deposit amount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white"
                        />
                        <button
                            onClick={() => handleBalanceChange(true)}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Deposit
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                        <input
                            type="number"
                            placeholder="Withdraw amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white"
                        />
                        <button
                            onClick={() => handleBalanceChange(false)}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Withdraw
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                        <div className="flex gap-1">
                            <input
                                type="number"
                                placeholder="Amount"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white w-28"
                            />
                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                className="px-2 py-1 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white max-w-[150px]"
                            >
                                <option value="" disabled>Select target</option>
                                {allAccounts.length > 0 && (
                                    <optgroup label="Accounts">
                                        {allAccounts.map(acc => (
                                            <option key={`acc-${acc.accountNumber}`} value={`ACCOUNT:${acc.accountNumber}`}>
                                                {acc.accountType} (#{acc.accountNumber})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                                {allBudgets.length > 0 && (
                                    <optgroup label="Budgets">
                                        {allBudgets.map(b => (
                                            <option key={`budget-${b.id}`} value={`BUDGET:${b.id}`}>
                                                {b.description || `Budget #${b.id}`}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>
                        <button
                            onClick={handleTransfer}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}