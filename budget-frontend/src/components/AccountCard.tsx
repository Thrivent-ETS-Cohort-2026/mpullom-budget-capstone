import { useContext, useState } from "react";
import { Account, AccountType, AccountStatus } from "@/types/DataTypes";
import { AuthContext } from "@/context/AuthContext";

export default function AccountCard({ account }: { account: Account }) {
    if (!account) return null;

    const [accountType, setAccountType] = useState<AccountType>(account.accountType);
    const [balance, setBalance] = useState(account.balance ?? 0);

    const { currentUser } = useContext(AuthContext);

    async function handleTransfer() {
        // if (currentUser != null && account != null) {
        //     const newStatus: AccountStatus = isActive ? "SUSPENDED" : "ACTIVE";
        //     setAccountStatus(newStatus);

        //     await updateAccount(currentUser.token, {
        //         id: account.id,
        //         accountType: accountType,
        //         user: account.user,
        //         session_id: account.session_id,
        //         balance: balance,
        //         accountStatus: newStatus
        //     });
        // } else {
        //     console.log("Null values: update was rejected");
        // }
    }

    function handleSummary() {
        console.log("Viewing summary for account:", account.accountNumber);
    }


    async function handleBalanceChange(isDeposit: Boolean) {
        // if (currentUser != null && account != null) {
        //     await updateAccount(currentUser.token, {
        //         id: account.id,
        //         accountType: accountType,
        //         user: account.user,
        //         session_id: account.session_id,
        //         balance: balance,
        //         accountStatus: accountStatus
        //     });
        // } else {
        //     console.log("Null values: update was rejected");
        // }
    }

    async function handleEdit() {
        // if (isEditing) {
        //     if (currentUser != null && account != null) {
        //         await updateAccount(currentUser.token, {
        //             id: account.id,
        //             accountType: accountType,
        //             user: account.user,
        //             session_id: account.session_id,
        //             balance: balance,
        //             accountStatus: accountStatus
        //         });
        //     } else {
        //         console.log("Null values: update was rejected");
        //     }
        // }
        // setIsEditing(!isEditing);
    }

    return (
        <div className={`w-full p-3 border rounded-lg shadow-sm flex flex-col gap-2 transition-colors 
        bg-sky-600 text-slate-200
            `}>
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-0.5">
                    <div>
                        <select
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value as AccountType)}
                            className={`font-semibold text-base bg-transparent border-2 rounded px-1 transition-colors 
                                border-sky-800 cursor-default appearance-none`
                            }
                        >
                            {account.accountType + "Bud"}
                        </select>
                    </div>
                </div>

                <div className="text-3xl font-extrabold mr-6 text-green-400">
                    ${account.balance.toFixed(2)}
                </div>
            </div>

            <div className="flex justify-between items-center mt-0.5 w-full">
                <div className="flex gap-2">
                    <button
                        onClick={() => { handleBalanceChange(true) }}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                    >
                        Deposit
                    </button>
                    <button
                        onClick={() => { handleBalanceChange(false) }}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                    >
                        Withdraw
                    </button>
                    <button
                        onClick={handleTransfer}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                    >
                        Transfer
                    </button>
                    <button
                        onClick={handleSummary}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-xs font-medium rounded text-white transition-colors"
                    >
                        Summary
                    </button>
                </div>
            </div>
        </div>
    );
}