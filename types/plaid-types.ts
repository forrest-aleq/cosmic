/**
 * Type definitions for Plaid API data structures
 * These types match the Plaid API format for financial data
 */

/**
 * Account balance information
 */
export interface AccountBalance {
  /** The amount of funds available for use (null for credit cards and other debt accounts) */
  available: number | null;
  /** The total amount of funds in the account */
  current: number;
  /** The ISO currency code of the account, e.g. "USD" */
  iso_currency_code: string;
  /** For credit accounts, this represents the credit limit (null for depository accounts) */
  limit: number | null;
  /** Unofficial currency code (rarely used) */
  unofficial_currency_code: string | null;
}

/**
 * Bank account information
 */
export interface Account {
  /** Unique ID for the account */
  account_id: string;
  /** Balance information for the account */
  balances: AccountBalance;
  /** Last 4 digits of the account number */
  mask: string;
  /** Display name for the account (e.g., "Primary Checking") */
  name: string;
  /** Official name from the financial institution */
  official_name: string | null;
  /** Account subtype (e.g., "checking", "credit card") */
  subtype: AccountSubtype;
  /** Account type (e.g., "depository", "credit") */
  type: AccountType;
}

/**
 * Valid account types
 */
export type AccountType = "depository" | "credit" | "loan" | "investment" | "other";

/**
 * Valid account subtypes
 */
export type AccountSubtype =
  // Depository subtypes
  | "checking"
  | "savings"
  | "hsa"
  | "cd"
  | "money market"
  | "paypal"
  | "prepaid"
  // Credit subtypes
  | "credit card"
  | "line of credit"
  // Loan subtypes
  | "auto"
  | "commercial"
  | "construction"
  | "consumer"
  | "home"
  | "home equity"
  | "loan"
  | "mortgage"
  | "overdraft"
  | "student"
  // Investment subtypes
  | "529"
  | "401a"
  | "401k"
  | "403b"
  | "457b"
  | "brokerage"
  | "cash isa"
  | "education savings account"
  | "gic"
  | "health reimbursement arrangement"
  | "ira"
  | "isa"
  | "keogh"
  | "lif"
  | "lira"
  | "lrif"
  | "lrsp"
  | "mutual fund"
  | "non-taxable brokerage account"
  | "pension"
  | "plan"
  | "prif"
  | "profit sharing plan"
  | "rdsp"
  | "resp"
  | "retirement"
  | "rlif"
  | "roth"
  | "roth 401k"
  | "rrif"
  | "rrsp"
  | "sarsep"
  | "sep ira"
  | "simple ira"
  | "sipp"
  | "stock plan"
  | "tfsa"
  | "trust"
  | "ugma"
  | "utma"
  | "variable annuity"
  // Other subtypes
  | "other";

/**
 * Location information for a transaction
 */
export interface TransactionLocation {
  /** Street address */
  address: string | null;
  /** City name */
  city: string | null;
  /** Country code */
  country: string | null;
  /** Latitude coordinate */
  lat: number | null;
  /** Longitude coordinate */
  lon: number | null;
  /** Postal code */
  postal_code: string | null;
  /** Region or state */
  region: string | null;
  /** Store number if applicable */
  store_number: string | null;
}

/**
 * Payment metadata for a transaction
 */
export interface PaymentMeta {
  /** Reference number */
  reference_number: string | null;
  /** Payment method */
  payment_method: string | null;
  /** Payment processor */
  payment_processor: string | null;
  /** Reason for the payment */
  reason: string | null;
  /** ID for payee */
  payee_id: string | null;
  /** ID for payer */
  payer_id: string | null;
  /** Check number if applicable */
  check_number: string | null;
  /** ACH class code if applicable */
  ach_class: string | null;
}

/**
 * Transaction data structure
 */
export interface Transaction {
  /** Unique ID for the transaction */
  transaction_id: string;
  /** ID of the account this transaction belongs to */
  account_id: string;
  /** Transaction amount (positive for credits, negative for debits) */
  amount: number;
  /** ISO currency code */
  iso_currency_code: string;
  /** Unofficial currency code (rarely used) */
  unofficial_currency_code: string | null;
  /** Transaction categories assigned by Plaid */
  category: string[] | null;
  /** Plaid's category ID */
  category_id: string | null;
  /** Whether the transaction is pending or settled */
  pending: boolean;
  /** Pending transaction ID that this transaction replaces, if applicable */
  pending_transaction_id: string | null;
  /** Description of the transaction as provided by the financial institution */
  original_description: string | null;
  /** Clean name of the merchant/counterparty */
  merchant_name: string | null;
  /** Raw description of the transaction from the financial institution */
  name: string;
  /** Date of the transaction, in format "YYYY-MM-DD" */
  date: string;
  /** Date when the transaction was authorized, in format "YYYY-MM-DD" */
  authorized_date: string | null;
  /** Location data for the transaction */
  location: TransactionLocation;
  /** Payment metadata for the transaction */
  payment_meta: PaymentMeta;
  /** Account owner (useful for joint accounts) */
  account_owner: string | null;
  /** Transaction code if available */
  transaction_code: string | null;
}

/**
 * Minimal transaction data for removed transactions
 */
export interface RemovedTransaction {
  /** ID of the transaction that was removed */
  transaction_id: string;
  /** ID of the account this transaction belonged to */
  account_id: string;
}

/**
 * Plaid Transactions Sync API response format
 */
export interface PlaidTransactionsResponse {
  /** List of accounts that had transactions */
  accounts: Account[];
  /** Newly added transactions */
  added: Transaction[];
  /** Modified transactions */
  modified: Transaction[];
  /** Removed transactions */
  removed: RemovedTransaction[];
  /** Cursor for the next page of results */
  next_cursor: string;
  /** Whether there are more results to fetch */
  has_more: boolean;
  /** ID of this request (for debugging) */
  request_id: string;
  /** Status of transaction updates */
  transactions_update_status: "partial_completion" | "full_completion";
}

/**
 * Company profile data structure for generating realistic financial data
 */
export interface CompanyProfile {
  /** Name of the company */
  company_name: string;
  /** Industry the company operates in */
  industry: string;
  /** Business model (B2B, B2C, etc.) */
  business_model: string;
  /** Size category of the company */
  company_size: string;
  /** When the company was founded */
  founding_date: Date;
  /** Company location */
  location?: string;
  /** Annual revenue estimate */
  annual_revenue?: number;
}
