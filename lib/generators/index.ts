/**
 * Main export file for all generators
 * Follows the principle of separation of concerns by providing
 * a clear API for interacting with the generator modules
 */

export * from "./company-generator";
export * from "./account-generator";
export * from "./config";

// Re-export types for convenience
export { 
  CompanyProfile,
  Account, 
  Transaction, 
  RemovedTransaction,
  PlaidTransactionsResponse
} from "@/types/plaid-types";
