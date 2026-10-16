export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  token: string;
}

export type AccountType = "CHECKING" | "SAVINGS";
export type AccountStatus = "ACTIVE" | "CLOSED" | "SUSPENDED";

export interface Account {
  accountNumber: number;
  accountType: AccountType;
  user: User;
  balance: number;
  accountStatus : AccountStatus;
}

export interface Transfer {
  id: number;
  amount: number;
  sender_account_id: number;
  receiver_account_id: number;
}

export enum TransactionType {
    ACCOUNT_WITHDRAWL = "ACCOUNT_WITHDRAWL",
    ACCOUNT_DEPOSIT = "ACCOUNT_DEPOSIT",
    BUDGET_TRANSFER = "BUDGET_TRANSFER",
    BUDGET_WITHDRAWL = "BUDGET_WITHDRAWL",
    WITHDRAWL = "WITHDRAWL", 
    DEPOSIT = "DEPOSIT"
}

export interface Transaction {
    transactionId?: number;
    account?: Account;
    budget?: BudgetType;
    transactionType: TransactionType;
    amount: number;
    timestamp?: string
    recurrence: boolean;
    description: string;
}

export type TargetPeriod = "MONTHLY" | "WEEKLY" | "YEARLY";

export interface BudgetType {
  id: number;
  user: User;
  description: string;
  targetPeriod: TargetPeriod;
  currentAmount: number;
  maxAmount: number;
  enabled: boolean;
}

export interface BudgetRequest {
  user: User;
  description: string;
  targetPeriod: TargetPeriod;
  currentAmount: number;
  maxAmount: number;
  enabled: boolean;
}