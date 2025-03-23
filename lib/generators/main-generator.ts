/**
 * Main generator module
 * Integrates company, account, and transaction generators
 * to create a complete financial data package
 */

import { 
  CompanyProfile, 
  Account, 
  Transaction,
  RemovedTransaction,
  PlaidTransactionsResponse 
} from "@/types/plaid-types";
import { 
  generateCompanyProfile,
  calculateFinancialMetrics
} from "./company-generator";
import { generateAccountSet } from "./account-generator";
import { generateTransactionSet } from "./transaction-generator";
import type { DataGenerationOptions } from "../schema";

/**
 * Generate a complete financial data package
 * @param companyData - Partial company profile data from form
 * @param options - Configuration options for data generation
 * @returns A complete Plaid API formatted response
 */
export function generateFinancialData(
  companyData: Partial<CompanyProfile>,
  options: DataGenerationOptions
): PlaidTransactionsResponse {
  // Early return if required data is missing
  if (!companyData.company_name || !companyData.industry || !companyData.business_model || !companyData.company_size) {
    throw new Error("Missing required company profile data");
  }
  
  // 1. Generate complete company profile
  const companyProfile = generateCompanyProfile(companyData);
  
  // 2. Generate account set based on company profile
  const accounts = generateAccountSet(companyProfile);
  
  // Filter accounts based on options
  const filteredAccounts = accounts.filter(account => {
    if (!options.include_deposits && account.type === "depository") return false;
    if (!options.include_payments && account.type === "credit") return false;
    if (!options.include_investments && account.type === "investment") return false;
    if (!options.include_loans && account.type === "loan") return false;
    return true;
  });
  
  // Early return if no accounts remain after filtering
  if (filteredAccounts.length === 0) {
    throw new Error("No accounts available. Please enable at least one account type in options.");
  }

  // 3. Generate transaction set based on company profile and accounts
  const { added, modified, removed } = generateTransactionSet(
    filteredAccounts,
    companyProfile,
    {
      addedCount: options.num_transactions,
      startDate: options.start_date,
      endDate: options.end_date
    }
  );

  // 4. Return structured in Plaid API format
  return {
    accounts: filteredAccounts,
    added: options.include_payments ? added : [],
    modified: modified,
    removed: removed,
    next_cursor: "end",
    has_more: false,
    request_id: generateRequestId(),
    transactions_update_status: "full_completion"
  };
}

/**
 * Generate a request ID for the Plaid API response
 * @returns A randomly generated request ID string
 */
function generateRequestId(): string {
  return `req_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Format the data for download
 * @param data The Plaid API formatted data
 * @returns A JSON string with pretty formatting
 */
export function formatDataForDownload(data: PlaidTransactionsResponse): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate sample data based on minimal inputs
 * Useful for quick previews with reasonable defaults
 * @param companyName Name of the company
 * @param industry Industry of the company
 * @returns A complete Plaid API formatted response
 */
export function generateSampleData(companyName: string, industry: string): PlaidTransactionsResponse {
  // Create minimal company profile
  const companyProfile: Partial<CompanyProfile> = {
    company_name: companyName,
    industry: industry,
    business_model: "B2B", // Default
    company_size: "Medium (51-200)", // Default
    founding_date: new Date(2010, 0, 1) // Default
  };
  
  // Default options
  const options: DataGenerationOptions = {
    num_transactions: 100,
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    end_date: new Date(),
    include_deposits: true,
    include_payments: true,
    include_investments: true,
    include_loans: true
  };
  
  // Use the main generator function
  return generateFinancialData(companyProfile, options);
}
