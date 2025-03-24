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
  payee: string | null;
  /** ID for payer */
  payer: string | null;
  /** By order of */
  by_order_of: string | null;
  /** Check number if applicable */
  ppd_id: string | null;
}

/**
 * Counterparty information for a transaction
 */
export interface Counterparty {
  /** Name of the counterparty */
  name: string;
  /** Type of counterparty (merchant, marketplace) */
  type: string;
  /** URL to the counterparty's logo */
  logo_url: string | null;
  /** Website of the counterparty */
  website: string | null;
  /** Entity ID of the counterparty */
  entity_id: string;
  /** Confidence level of the match */
  confidence_level: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW";
}

/**
 * Personal finance category information
 */
export interface PersonalFinanceCategory {
  /** Primary category (e.g., FOOD_AND_DRINK) */
  primary: string;
  /** Detailed category (e.g., FOOD_AND_DRINK_FAST_FOOD) */
  detailed: string;
  /** Confidence level of the categorization */
  confidence_level: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW";
}

/**
 * Payment channel types
 */
export type PaymentChannel = "online" | "in store" | "other";

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
  /** Raw description of the transaction from the financial institution */
  name: string;
  /** Date of the transaction, in format "YYYY-MM-DD" */
  date: string;
  /** ISO 8601 timestamp of the transaction */
  datetime?: string;
  /** Date when the transaction was authorized, in format "YYYY-MM-DD" */
  authorized_date: string | null;
  /** ISO 8601 timestamp of when the transaction was authorized */
  authorized_datetime?: string | null;
  /** Location data for the transaction */
  location: TransactionLocation;
  /** Payment metadata for the transaction */
  payment_meta: PaymentMeta;
  /** Account owner (useful for joint accounts) */
  account_owner: string | null;
  /** Transaction code if available */
  transaction_code: string | null;
  /** Clean name of the merchant/counterparty */
  merchant_name: string | null;
  /** Merchant entity ID if available */
  merchant_entity_id?: string | null;
  /** URL to the merchant's logo */
  logo_url?: string | null;
  /** Website of the merchant */
  website?: string | null;
  /** Channel through which the transaction was made */
  payment_channel?: PaymentChannel;
  /** Type of transaction (place, digital, etc.) */
  transaction_type?: string;
  /** Information about transaction counterparties */
  counterparties?: Counterparty[];
  /** Personal finance categorization */
  personal_finance_category?: PersonalFinanceCategory;
  /** URL to the personal finance category icon */
  personal_finance_category_icon_url?: string | null;
}

/**
 * Minimal transaction data for removed transactions
 */
export interface RemovedTransaction {
  /** Transaction ID of the removed transaction */
  transaction_id: string;
  /** Account ID the transaction belongs to */
  account_id: string;
}

/**
 * Plaid Transactions Sync API response format
 */
export interface PlaidTransactionsResponse {
  /** List of accounts */
  accounts: Account[];
  /** Added transactions */
  added: Transaction[];
  /** Modified transactions */
  modified: Transaction[];
  /** Removed transactions */
  removed: RemovedTransaction[];
  /** Cursor for pagination */
  next_cursor: string;
  /** Whether there are more transactions to fetch */
  has_more: boolean;
  /** Request ID for this API call */
  request_id: string;
  /** Status of the transaction update */
  transactions_update_status?: "PARTIAL_COMPLETION" | "FULL_COMPLETION" | "HISTORICAL_UPDATE_COMPLETE"; 
  /** Optional item_id field */
  item_id?: string;
}

/**
 * Company profile data structure for generating realistic financial data
 */
export interface CompanyProfile {
  /** Name of the company */
  company_name: string;
  /** Industry the company operates in */
  industry: string;
  /** Business model of the company */
  business_model: string;
  /** Size of the company */
  company_size: string;
  /** When the company was founded */
  founding_date: Date;
  /** Location of the company headquarters */
  location?: string;
  /** Annual revenue of the company */
  annual_revenue?: number;
}
