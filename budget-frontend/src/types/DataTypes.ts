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
  accountStatus: AccountStatus;
}

export interface Transfer {
  transferId: number;
  account: Account;
  budget: BudgetType;
  amount: number;
  receiver_account_id: number;
  description: string;
  timestamp?: string
}

export interface Transaction {
  transactionId?: number;
  account?: Account;
  transactionType: TransactionType;
  amount: number;
  timestamp?: string
  recurrencePeriod: number;
  description: string;
}

export enum TransferType {
  ACCOUNT_TRANSFER = "ACCOUNT_TRANSFER",
  BUDGET_TRANSFER = "BUDGET_TRANSFER",
}

export enum TransactionType {
  ACCOUNT_WITHDRAWL = "ACCOUNT_WITHDRAWL",
  ACCOUNT_DEPOSIT = "ACCOUNT_DEPOSIT",
  BUDGET_WITHDRAWL = "BUDGET_WITHDRAWL",
  BUDGET_DEPOSIT = "BUDGET_DEPOSIT"
}

export interface Transaction {
  transactionId?: number;
  account?: Account;
  transactionType: TransactionType;
  amount: number;
  timestamp?: string
  recurrencePeriod: number;
  description: string;
}

export type TargetPeriod = "MONTHLY" | "QUARTERLY" | "YEARLY";

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