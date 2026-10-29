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
  timestamp?: string;
  category: Category;
}

export interface Transaction {
  transactionId?: number;
  account?: Account;
  transactionType: TransactionType;
  amount: number;
  timestamp?: string
  recurrencePeriod: number;
  description: string;
  category: Category;
}

export enum TransferType {
  ACCOUNT_TRANSFER = "ACCOUNT_TRANSFER",
  BUDGET_TRANSFER = "BUDGET_TRANSFER",
}

export enum TransactionType {
  ACCOUNT_WITHDRAWAL = "ACCOUNT_WITHDRAWAL",
  ACCOUNT_DEPOSIT = "ACCOUNT_DEPOSIT",
  BUDGET_WITHDRAWAL = "BUDGET_WITHDRAWAL",
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
  category: Category;
}


export enum TargetPeriod {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY"
}

export enum Category {
  FOOD = "FOOD",
  GROCERIES = "GROCERIES",
  GAS = "GAS",
  WORK = "WORK",
  BILLS = "BILLS",
  UNEXPECTED = "UNEXPECTED",
  Other = "Other"
}

export interface BudgetType {
  id: number;
  user: User;
  description: string;
  targetPeriod: TargetPeriod;
  currentAmount: number;
  maxAmount: number;
  enabled: boolean;
  startDate: string;
  category: Category;
}

export interface BudgetRequest {
  user: User;
  description: string;
  targetPeriod: TargetPeriod;
  currentAmount: number;
  maxAmount: number;
  enabled: boolean;
}

export interface BudgetTallyResponse {
  currentAmountTally: number;
  maxAmountTally: number;
}

export interface AccountRequest {
  accountNumber?: number;
  accountType: string;
  balance: number;
  accountStatus: string;
}