import { useContext, useState, useEffect } from "react";
import { Account, BudgetType, TransactionType } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { updateAccountBalance, fetchAccounts } from "@/lib/accountApi";
import { fetchBudgets } from "@/lib/budgetApi";
import { createTransaction } from "@/lib/transactionApi";
import Notification from "@/components/Notification";
import { useRouter } from "next/navigation";

export default function AccountCard({ account }: { account: Account }) {
    if (!account) return null;

    const [currentBalance, setCurrentBalance] = useState(account.balance ?? 0);
    
    const [depositAmount, setDepositAmount] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");
    const [transferAmount, setTransferAmount] = useState<string>("");

    const [selectedAccountBudget, setSelectedAccountBudget] = useState<string>(""); 
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    
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
            if (!selectedAccountBudget) {
                setNotificationMessage("Please select a budget from the dropdown above before submitting this transaction.");
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
                const transactionData = {
                    account: { accountNumber: account.accountNumber },
                    budget: { id: Number(selectedAccountBudget) },
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
                setNotificationMessage(`Successfully processed ${isDeposit ? "deposit" : "withdrawal"}!`);

                if (isDeposit) {
                    setDepositAmount("");
                } else {
                    setWithdrawAmount("");
                }
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

            try {
                const transactionData = {
                    account: { accountNumber: account.accountNumber },
                    budget: { id: Number(selectedAccountBudget) },
                    transactionType: TransactionType.BUDGET_TRANSFER,
                    amount: amount,
                    description: `Transfer from Account #${account.accountNumber} using Budget #${selectedAccountBudget}`,
                    recurrence: false
                };

                await createTransaction(currentUser.token, transactionData);

                const newBalance = currentBalance - amount;

                await updateAccountBalance(currentUser.token, account.accountNumber, newBalance);
                
                setCurrentBalance(newBalance);
                setTransferAmount("");
                setNotificationMessage("Successfully processed transfer!");
            } catch (err) {
                console.error("Failed to process transfer:", err);
                setNotificationMessage("Failed to process transfer transaction.");
            }
        } else {
            console.log("Null values: update was rejected");
        }
    }

    const isDepositTyping = depositAmount.length > 0;
    const isWithdrawTyping = withdrawAmount.length > 0;
    const isTransferTyping = transferAmount.length > 0;

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

                <div className="text-3xl font-bold mr-6 text-green-400">
                    Balance: ${currentBalance.toFixed(2)}
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-1">
                <div className="w-full flex flex-col gap-1">
                    <label className="text-xs font-medium text-sky-200">Account Budget Specification</label>
                    <select
                        value={selectedAccountBudget}
                        onChange={(e) => setSelectedAccountBudget(e.target.value)}
                        className="px-2 py-1.5 text-xs rounded bg-sky-900 text-white border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white w-full"
                    >
                        <option value="" disabled>Select a budget for transactions</option>
                        {allBudgets.map(b => (
                            <option key={`account-budget-${b.id}`} value={b.id}>
                                {b.description || `Budget #${b.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-between items-center w-full gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                        <input
                            type="number"
                            placeholder="Deposit amount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            disabled={isWithdrawTyping || isTransferTyping}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50"
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
                            disabled={isDepositTyping || isTransferTyping}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50"
                        />
                        <button
                            onClick={() => handleBalanceChange(false)}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                        >
                            Withdraw
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                        <input
                            type="number"
                            placeholder="Transfer amount"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            disabled={isDepositTyping || isWithdrawTyping}
                            className="px-2 py-1 text-xs rounded bg-sky-900 text-white placeholder-sky-300 border border-sky-500 focus:outline-none focus:ring-1 focus:ring-white w-full disabled:opacity-50"
                        />
                        <button
                            onClick={handleTransfer}
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