export interface User {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
}

export interface Account {
  id: string;
  member_id: number;
  session_id: number;
  balance: number;
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

export interface Budget {
  id: number;
  member_id: number;
  description: string;
  target_period: string;
  enabled: boolean;
}