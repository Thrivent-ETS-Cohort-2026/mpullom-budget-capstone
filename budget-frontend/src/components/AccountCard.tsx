import { useContext, useState } from "react";
import { Account } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";
import { updateAccountBalance } from "@/lib/accountApi";
import { useRouter } from "next/navigation";

export default function AccountCard({ account }: { account: Account }) {
    if (!account) return null;

    const [currentBalance, setCurrentBalance] = useState(account.balance ?? 0);
    
    const [depositAmount, setDepositAmount] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");

    const { currentUser } = useContext(AuthContext);
    const router = useRouter();

    async function handleTransfer() {
    }

    async function handleBalanceChange(isDeposit: boolean) {
        if (currentUser != null && account != null) {
            const rawAmount = isDeposit ? depositAmount : withdrawAmount;
            const amount = parseFloat(rawAmount);

            if (isNaN(amount) || amount <= 0) {
                console.log("Invalid amount entered");
                return;
            }

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

                    <div className="flex gap-2 items-end pb-0.5">
                        <button
                            onClick={handleTransfer}
                            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors h-6.5"
                        >
                            Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}