/**
 * Interface for HBD savings deposit transactions
 */
export interface DepositTransaction {
  id: string;
  from_account: string;
  to_account: string;
  amount: string;
  symbol: string;
  memo: string;
  timestamp: Date;
}

/**
 * Interface for HBD savings withdrawal transactions
 */
export interface WithdrawalTransaction {
  id: string;
  from_account: string;
  to_account: string;
  request_id: string;
  memo: string;
  amount: string;
  symbol: string;
  timestamp: Date;
}

/**
 * Interface for total amount queries (deposits/withdrawals)
 */
export interface TotalAmount {
  total_amount: string;
}

/**
 * Interface for total interest accrued
 */
export interface TotalInterest {
  total_interest: string;
}

/**
 * Interface for current HBD interest rate
 */
export interface InterestRate {
  hbd_interest: string;
}

/**
 * Interface for user's HBD savings account details
 */
export interface SavingsDetails {
  hbd: string;
  hbd_savings: string;
  last_payment_date: Date | null;
  estimated_interest: string;
}

/**
 * Interface for interest payment records
 */
export interface InterestPayment {
  id: string;
  owner: string;
  interest: string;
  interest_symbol: string;
  is_saved_into_hbd_balance: boolean;
  timestamp: Date;
}

/**
 * Interface for database query response with pagination info
 */
export interface QueryResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * Interface for database connection configuration
 */
export interface DatabaseConfig {
  user: string;
  password: string;
  database: string;
  host: string;
  port?: number;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}
