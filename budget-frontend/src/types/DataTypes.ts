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
  accountNumber: string;
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

export interface Transaction {
  id: number;
  account_id: number;
  time_stamp: Date;
  transaction_type: string;
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