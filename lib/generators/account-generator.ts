/**
 * Account generation module
 * Handles creation of realistic bank accounts and credit cards
 * following Plaid API format specifications
 */

import { Account, AccountType, AccountSubtype } from "@/types/plaid-types";
import { BANK_OPTIONS } from "./config";
import { CompanyProfile } from "@/types/plaid-types";

/**
 * Generate a unique account ID for use with Plaid API format
 * @returns A string ID in the format expected by Plaid
 */
export function generateAccountId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 22; // Standard Plaid ID length
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generate a 4-digit account mask (last 4 digits)
 * @returns A random 4-digit string
 */
export function generateAccountMask(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate a bank account (depository type)
 * @param bankName The name of the bank
 * @param accountType The specific account subtype
 * @param balance Optional specific balance to set
 * @returns A Plaid-formatted Account object
 */
export function generateBankAccount(
  bankName: string, 
  accountType: "checking" | "savings" | "cd" | "money market" = "checking",
  balance?: number
): Account {
  // Get bank specific info or use defaults
  const bank = BANK_OPTIONS[bankName as keyof typeof BANK_OPTIONS] || 
    BANK_OPTIONS[Object.keys(BANK_OPTIONS)[Math.floor(Math.random() * Object.keys(BANK_OPTIONS).length)] as keyof typeof BANK_OPTIONS];
  
  // Determine account name based on type
  let name: string;
  let officialName: string;
  
  if (accountType === "checking") {
    name = "Primary Checking";
    officialName = bank.businessChecking[Math.floor(Math.random() * bank.businessChecking.length)];
  } else if (accountType === "savings") {
    name = "Business Savings";
    officialName = bank.businessSavings[Math.floor(Math.random() * bank.businessSavings.length)];
  } else if (accountType === "cd") {
    name = "Business CD";
    officialName = "Business Certificate of Deposit";
  } else {
    name = "Money Market";
    officialName = "Business Money Market Savings";
  }
  
  // Generate a realistic balance if not provided
  const accountBalance = balance !== undefined ? balance : 
    (accountType === "checking" ? 10000 + Math.random() * 90000 : 
     accountType === "savings" ? 20000 + Math.random() * 180000 :
     accountType === "cd" ? 50000 + Math.random() * 150000 :
     30000 + Math.random() * 120000);
  
  return {
    account_id: generateAccountId(),
    balances: {
      available: accountBalance,
      current: accountBalance,
      iso_currency_code: "USD",
      limit: null,
      unofficial_currency_code: null,
    },
    mask: generateAccountMask(),
    name: name,
    official_name: officialName,
    subtype: accountType,
    type: "depository"
  };
}

/**
 * Generate a credit card account
 * @param bankName The name of the issuing bank
 * @param creditLimit Optional specific credit limit
 * @param currentBalance Optional current balance
 * @returns A Plaid-formatted Account object for a credit card
 */
export function generateCreditCard(
  bankName: string, 
  creditLimit?: number, 
  currentBalance?: number
): Account {
  // Get bank specific info or use defaults
  const bank = BANK_OPTIONS[bankName as keyof typeof BANK_OPTIONS] || 
    BANK_OPTIONS[Object.keys(BANK_OPTIONS)[Math.floor(Math.random() * Object.keys(BANK_OPTIONS).length)] as keyof typeof BANK_OPTIONS];
  
  // Select a credit card product
  const cardProduct = bank.creditCards[Math.floor(Math.random() * bank.creditCards.length)];
  
  // Generate reasonable credit limit if not provided
  const limit = creditLimit || Math.floor(10000 + Math.random() * 90000);
  
  // Generate current balance as a percentage of the limit
  const balance = currentBalance !== undefined ? currentBalance : 
    -(Math.floor((0.2 + Math.random() * 0.5) * limit));
  
  return {
    account_id: generateAccountId(),
    balances: {
      available: limit + balance, // Available credit
      current: balance, // Current balance (negative for amount owed)
      iso_currency_code: "USD",
      limit: limit,
      unofficial_currency_code: null,
    },
    mask: generateAccountMask(),
    name: `Business ${cardProduct}`,
    official_name: `${bankName} ${cardProduct} Credit Card`,
    subtype: "credit card",
    type: "credit"
  };
}

/**
 * Generate an investment account
 * @param bankName The name of the bank
 * @param investmentType The specific investment account type
 * @param balance Optional specific balance
 * @returns A Plaid-formatted Account object for an investment account
 */
export function generateInvestmentAccount(
  bankName: string,
  investmentType: "brokerage" | "401k" | "ira" | "roth" = "brokerage",
  balance?: number
): Account {
  // Generate a realistic investment balance if not provided
  const accountBalance = balance !== undefined ? balance : 
    (investmentType === "brokerage" ? 50000 + Math.random() * 450000 : 
     investmentType === "401k" ? 100000 + Math.random() * 900000 :
     investmentType === "ira" ? 50000 + Math.random() * 450000 :
     investmentType === "roth" ? 30000 + Math.random() * 270000 :
     100000 + Math.random() * 400000);
  
  return {
    account_id: generateAccountId(),
    balances: {
      available: null, // Investment accounts typically don't have "available" balances
      current: accountBalance,
      iso_currency_code: "USD",
      limit: null,
      unofficial_currency_code: null,
    },
    mask: generateAccountMask(),
    name: investmentType.toUpperCase(),
    official_name: `Business ${investmentType.toUpperCase()} Investment Account`,
    subtype: investmentType,
    type: "investment"
  };
}

/**
 * Generate a loan account
 * @param bankName The name of the bank
 * @param loanType The specific loan type
 * @param balance Optional specific balance (will be negative)
 * @returns A Plaid-formatted Account object for a loan
 */
export function generateLoanAccount(
  bankName: string,
  loanType: "line of credit" | "commercial" | "construction" | "mortgage" = "line of credit",
  balance?: number
): Account {
  // Get bank specific info or use defaults
  const bank = BANK_OPTIONS[bankName as keyof typeof BANK_OPTIONS] || 
    BANK_OPTIONS[Object.keys(BANK_OPTIONS)[Math.floor(Math.random() * Object.keys(BANK_OPTIONS).length)] as keyof typeof BANK_OPTIONS];
  
  // Generate a realistic loan balance if not provided
  const loanBalance = balance !== undefined ? balance : 
    (loanType === "line of credit" ? -Math.floor(50000 + Math.random() * 200000) : 
     loanType === "commercial" ? -Math.floor(200000 + Math.random() * 800000) :
     loanType === "construction" ? -Math.floor(300000 + Math.random() * 1200000) :
     loanType === "mortgage" ? -Math.floor(500000 + Math.random() * 2000000) :
     -Math.floor(100000 + Math.random() * 400000));
  
  // For line of credit, also include a limit
  const limit = loanType === "line of credit" ? Math.abs(loanBalance) : null;
  
  return {
    account_id: generateAccountId(),
    balances: {
      available: loanType === "line of credit" ? limit! + loanBalance : null,
      current: loanBalance,
      iso_currency_code: "USD",
      limit: limit,
      unofficial_currency_code: null,
    },
    mask: generateAccountMask(),
    name: `${loanType.charAt(0).toUpperCase() + loanType.slice(1)}`,
    official_name: `Business ${loanType.charAt(0).toUpperCase() + loanType.slice(1)}`,
    subtype: loanType === "line of credit" ? loanType : loanType as AccountSubtype,
    type: loanType === "line of credit" ? "credit" : "loan"
  };
}

/**
 * Generate a full set of accounts based on company profile
 * @param profile The company profile to generate accounts for
 * @returns An array of Plaid-formatted Account objects
 */
export function generateAccountSet(profile: CompanyProfile): Account[] {
  // Determine number of accounts based on company size
  const sizeToAccountCount = {
    "Startup (1-10)": { total: 3, checking: 1, savings: 1, credit: 1, investment: 0, loan: 0 },
    "Small (11-50)": { total: 5, checking: 1, savings: 1, credit: 2, investment: 1, loan: 0 },
    "Medium (51-200)": { total: 7, checking: 2, savings: 1, credit: 2, investment: 1, loan: 1 },
    "Large (201-1000)": { total: 10, checking: 2, savings: 2, credit: 3, investment: 2, loan: 1 },
    "Enterprise (1000+)": { total: 15, checking: 3, savings: 2, credit: 4, investment: 3, loan: 3 },
  };
  
  // Get account distribution for this company size
  const accountDistribution = sizeToAccountCount[profile.company_size as keyof typeof sizeToAccountCount] || 
    sizeToAccountCount["Small (11-50)"];
  
  // Calculate realistic account balances based on annual revenue
  const annualRevenue = profile.annual_revenue || 1000000;
  
  // Choose a primary bank
  const bankNames = Object.keys(BANK_OPTIONS);
  const primaryBank = bankNames[Math.floor(Math.random() * bankNames.length)];
  
  // List to hold all generated accounts
  const accounts: Account[] = [];
  
  // Generate checking accounts
  for (let i = 0; i < accountDistribution.checking; i++) {
    const balance = i === 0 
      ? Math.floor(annualRevenue * 0.08 * (0.7 + Math.random() * 0.6)) // Primary checking
      : Math.floor(annualRevenue * 0.03 * (0.7 + Math.random() * 0.6)); // Secondary checking
    
    accounts.push(generateBankAccount(primaryBank, "checking", balance));
  }
  
  // Generate savings accounts
  for (let i = 0; i < accountDistribution.savings; i++) {
    const balance = Math.floor(annualRevenue * 0.15 * (0.7 + Math.random() * 0.6));
    accounts.push(generateBankAccount(primaryBank, "savings", balance));
  }
  
  // Generate credit cards
  for (let i = 0; i < accountDistribution.credit; i++) {
    const limit = i === 0
      ? Math.floor(annualRevenue * 0.05) // Primary credit card
      : Math.floor(annualRevenue * 0.02); // Secondary credit cards
    
    const balance = -Math.floor(limit * (0.3 + Math.random() * 0.4)); // 30-70% utilized
    
    // Use primary bank for main card, may use other banks for additional cards
    const cardBank = i === 0 ? primaryBank : bankNames[Math.floor(Math.random() * bankNames.length)];
    accounts.push(generateCreditCard(cardBank, limit, balance));
  }
  
  // Generate investment accounts if appropriate
  for (let i = 0; i < accountDistribution.investment; i++) {
    // Choose investment type based on index
    const investmentTypes: AccountSubtype[] = ["brokerage", "401k", "ira", "roth"];
    const investmentType = investmentTypes[i % investmentTypes.length] as "brokerage" | "401k" | "ira" | "roth";
    
    const balance = Math.floor(annualRevenue * (0.5 + Math.random() * 1.0));
    accounts.push(generateInvestmentAccount(primaryBank, investmentType, balance));
  }
  
  // Generate loan accounts if appropriate
  for (let i = 0; i < accountDistribution.loan; i++) {
    // Choose loan type based on index
    const loanTypes: AccountSubtype[] = ["line of credit", "commercial", "construction", "mortgage"];
    const loanType = loanTypes[i % loanTypes.length] as "line of credit" | "commercial" | "construction" | "mortgage";
    
    // Loan balance depends on type and annual revenue
    let balance: number;
    if (loanType === "line of credit") {
      balance = -Math.floor(annualRevenue * (0.1 + Math.random() * 0.3));
    } else if (loanType === "commercial") {
      balance = -Math.floor(annualRevenue * (0.5 + Math.random() * 1.0));
    } else if (loanType === "construction") {
      balance = -Math.floor(annualRevenue * (0.3 + Math.random() * 0.7));
    } else { // mortgage
      balance = -Math.floor(annualRevenue * (1.0 + Math.random() * 2.0));
    }
    
    accounts.push(generateLoanAccount(primaryBank, loanType, balance));
  }
  
  return accounts;
}
