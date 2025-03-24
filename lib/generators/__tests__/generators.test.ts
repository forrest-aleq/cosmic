/**
 * Generator tests
 * Tests for company profile, account, and transaction generators
 */

import { 
  generateCompanyProfile, 
  calculateFinancialMetrics 
} from "../company-generator";
import { generateAccountSet } from "../account-generator";
import { generateTransactionSet } from "../transaction-generator";
import { generateFinancialData, formatDataForDownload } from "../main-generator";
import { CompanyProfile } from "@/types/plaid-types";
import { DataGenerationOptions } from "@/lib/schema";
// Import setup but no need to import test functions as they're provided by Jest
import './jest.setup';

describe("Company Generator", () => {
  test("generates valid company profile", () => {
    const company = generateCompanyProfile();
    
    // Verify required fields
    expect(company.company_name).toBeDefined();
    expect(company.industry).toBeDefined();
    expect(company.business_model).toBeDefined();
    expect(company.company_size).toBeDefined();
    expect(company.founding_date).toBeDefined();
    
    // Verify calculated fields
    expect(company.annual_revenue).toBeGreaterThan(0);
  });
  
  test("calculates financial metrics correctly", () => {
    const baseProfile: CompanyProfile = {
      company_name: "Test Corp",
      industry: "Technology",
      business_model: "SaaS",
      company_size: "Medium (51-200)",
      founding_date: new Date(2010, 0, 1),
      location: "San Francisco, CA",
      annual_revenue: 0,  // Will be calculated
    };
    
    const profile = calculateFinancialMetrics(baseProfile);
    expect(profile.annual_revenue).toBeGreaterThan(0);
  });
});

describe("Account Generator", () => {
  test("generates appropriate accounts based on company size", () => {
    const smallCompany = generateCompanyProfile({
      company_name: "Small Co",
      company_size: "Small (11-50)"
    });
    
    const largeCompany = generateCompanyProfile({
      company_name: "Large Corp",
      company_size: "Large (201-1000)"
    });
    
    const smallAccounts = generateAccountSet(smallCompany);
    const largeAccounts = generateAccountSet(largeCompany);
    
    // Large companies should have more accounts
    expect(largeAccounts.length).toBeGreaterThan(smallAccounts.length);
    
    // Verify account structure
    smallAccounts.forEach(account => {
      expect(account.account_id).toBeDefined();
      expect(account.balances).toBeDefined();
      expect(account.name).toBeDefined();
      expect(account.type).toBeDefined();
    });
  });
});

describe("Transaction Generator", () => {
  test("generates transactions with proper account references", () => {
    const company = generateCompanyProfile();
    const accounts = generateAccountSet(company);
    
    const { added } = generateTransactionSet(accounts, company, {
      addedCount: 50,
      startDate: new Date(2023, 0, 1),
      endDate: new Date(2023, 2, 31)
    });
    
    // Verify transactions
    expect(added.length).toBe(50);
    
    added.forEach(transaction => {
      // Verify account reference
      expect(accounts.some(a => a.account_id === transaction.account_id)).toBe(true);
      
      // Verify transaction structure
      expect(transaction.transaction_id).toBeDefined();
      expect(transaction.date).toBeDefined();
      expect(transaction.amount).toBeDefined();
      expect(transaction.name).toBeDefined();
      
      // Verify date is within range - use string comparison since Plaid dates are in YYYY-MM-DD format
      const txDateStr = transaction.date; // In YYYY-MM-DD format
      expect(txDateStr >= "2023-01-01").toBe(true);
      expect(txDateStr <= "2023-03-31").toBe(true);
    });
  });
});

describe("Main Generator", () => {
  test("generateFinancialData integrates all generators correctly", () => {
    const companyData: Partial<CompanyProfile> = {
      company_name: "Test Integration Corp",
      industry: "Technology",
      business_model: "SaaS",
      company_size: "Medium (51-200)",
      founding_date: new Date(2020, 0, 1)
    };
    
    const options: DataGenerationOptions = {
      num_transactions: 100,
      start_date: new Date(2023, 0, 1),
      end_date: new Date(2023, 11, 31),
      include_deposits: true,
      include_payments: true,
      include_investments: false,
      include_loans: false
    };
    
    const data = generateFinancialData(companyData, options);
    
    // Verify structure matches Plaid format
    expect(data.accounts).toBeDefined();
    expect(data.accounts.length).toBeGreaterThan(0);
    expect(data.added).toBeDefined();
    expect(data.added.length).toBe(100);
    expect(data.request_id).toBeDefined();
    
    // Verify no investments or loans when not requested
    expect(data.accounts.some(a => a.type === "investment")).toBe(false);
    expect(data.accounts.some(a => a.type === "loan")).toBe(false);
  });
  
  test("formatDataForDownload returns valid JSON string", () => {
    const company = generateCompanyProfile();
    const accounts = generateAccountSet(company);
    const { added } = generateTransactionSet(accounts, company, { addedCount: 10 });
    
    const data = {
      accounts,
      added,
      modified: [],
      removed: [],
      request_id: "test_req_123",
      next_cursor: "end",
      has_more: false,
      transactions_update_status: "HISTORICAL_UPDATE_COMPLETE" as const,
      item_id: "item_test123"
    };
    
    const jsonStr = formatDataForDownload(data);
    
    // Verify it's valid JSON
    expect(() => JSON.parse(jsonStr)).not.toThrow();
    
    // Verify content
    const parsed = JSON.parse(jsonStr);
    expect(parsed.accounts).toEqual(accounts);
    expect(parsed.added).toEqual(added);
  });
  
  test("handles error cases correctly", () => {
    const validCompany: Partial<CompanyProfile> = {
      company_name: "No Accounts Co",
      industry: "Technology",
      business_model: "SaaS",
      company_size: "Medium (51-200)",
      founding_date: new Date(2020, 0, 1)
    };
    
    // Create options with all account types disabled
    const noAccountsOptions: DataGenerationOptions = {
      num_transactions: 100,
      start_date: new Date(2023, 0, 1),
      end_date: new Date(2023, 11, 31),
      include_deposits: false,
      include_payments: false, 
      include_investments: false,
      include_loans: false
    };
    
    // Should throw error for no accounts - verify it's the specific "No accounts available" error
    expect(() => {
      generateFinancialData(validCompany, noAccountsOptions);
    }).toThrow(/No accounts available/);
  });
});
