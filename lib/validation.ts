/**
 * Validation utilities for financial data
 * Includes functions to validate and ensure integrity of generated data
 */

import { PlaidTransactionsResponse, Account, Transaction } from "@/types/plaid-types";

/**
 * Validate a complete Plaid transactions response
 * Checks for common data inconsistencies and errors
 * @param data The Plaid API formatted data to validate
 * @returns An object with validation results
 */
export function validateFinancialData(data: PlaidTransactionsResponse): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required top-level properties
  if (!data.accounts || !Array.isArray(data.accounts) || data.accounts.length === 0) {
    errors.push("Missing or empty accounts array");
  }
  
  if (!data.added || !Array.isArray(data.added)) {
    errors.push("Missing transactions array");
  }
  
  if (!data.request_id) {
    errors.push("Missing request_id");
  }
  
  // Return early if critical errors
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }
  
  // Create lookup for account IDs
  const accountIds = new Set(data.accounts.map(account => account.account_id));
  
  // Validate accounts
  data.accounts.forEach((account, index) => {
    if (!account.account_id) {
      errors.push(`Account at index ${index} missing account_id`);
    }
    
    if (!account.balances || !account.balances.current) {
      errors.push(`Account ${account.account_id} missing balance information`);
    }
    
    if (!account.name) {
      warnings.push(`Account ${account.account_id} missing name`);
    }
    
    if (!account.type) {
      warnings.push(`Account ${account.account_id} missing type`);
    }
  });
  
  // Validate transactions
  data.added.forEach((transaction, index) => {
    if (!transaction.transaction_id) {
      errors.push(`Transaction at index ${index} missing transaction_id`);
    }
    
    if (!transaction.account_id) {
      errors.push(`Transaction ${transaction.transaction_id || index} missing account_id`);
    } else if (!accountIds.has(transaction.account_id)) {
      errors.push(`Transaction ${transaction.transaction_id || index} references non-existent account ${transaction.account_id}`);
    }
    
    if (!transaction.date) {
      errors.push(`Transaction ${transaction.transaction_id || index} missing date`);
    }
    
    if (transaction.amount === undefined || transaction.amount === null) {
      errors.push(`Transaction ${transaction.transaction_id || index} missing amount`);
    }
  });
  
  // Check for transaction date inconsistencies
  const transactionDates = data.added
    .map(t => new Date(t.date))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (transactionDates.length > 0) {
    const earliestDate = transactionDates[0];
    const latestDate = transactionDates[transactionDates.length - 1];
    const daySpan = Math.floor((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daySpan > 365 * 2) {
      warnings.push(`Transaction date range unusually large: ${daySpan} days`);
    }
    
    if (latestDate > new Date()) {
      warnings.push(`Some transactions have future dates`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate aggregate statistics from financial data
 * @param data The Plaid API formatted data to analyze
 * @returns Useful statistics about the data
 */
export function calculateDataStatistics(data: PlaidTransactionsResponse): {
  totalAccounts: number;
  totalTransactions: number;
  accountTypes: Record<string, number>;
  transactionVolume: number;
  averageTransactionAmount: number;
  transactionsByMonth: Record<string, number>;
} {
  const accountTypes: Record<string, number> = {};
  let transactionVolume = 0;
  const transactionsByMonth: Record<string, number> = {};
  
  // Count account types
  data.accounts.forEach(account => {
    accountTypes[account.type] = (accountTypes[account.type] || 0) + 1;
  });
  
  // Calculate transaction statistics
  data.added.forEach(transaction => {
    transactionVolume += Math.abs(transaction.amount);
    
    // Group by month
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    transactionsByMonth[monthKey] = (transactionsByMonth[monthKey] || 0) + 1;
  });
  
  return {
    totalAccounts: data.accounts.length,
    totalTransactions: data.added.length,
    accountTypes,
    transactionVolume,
    averageTransactionAmount: data.added.length > 0 ? transactionVolume / data.added.length : 0,
    transactionsByMonth,
  };
}

/**
 * Format Plaid data for CSV export
 * @param data The Plaid API formatted data
 * @returns A CSV string representation of the transactions
 */
export function formatTransactionsAsCsv(data: PlaidTransactionsResponse): string {
  // Create account name lookup
  const accountNames: Record<string, string> = {};
  data.accounts.forEach(account => {
    accountNames[account.account_id] = account.name;
  });
  
  // CSV header
  const header = ["Date", "Account", "Merchant", "Category", "Amount", "Status"];
  
  // Format each transaction as a CSV row
  const rows = data.added.map(tx => {
    const date = tx.date;
    const account = accountNames[tx.account_id] || tx.account_id;
    const merchant = tx.name;
    const category = tx.category ? tx.category.join(', ') : '';
    const amount = tx.amount.toFixed(2);
    const status = tx.pending ? 'Pending' : 'Posted';
    
    return [date, account, merchant, category, amount, status];
  });
  
  // Combine header and rows, escape fields properly
  const escapeCsvField = (field: string) => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };
  
  const csvRows = [
    header.map(escapeCsvField).join(','),
    ...rows.map(row => row.map(field => escapeCsvField(String(field))).join(','))
  ];
  
  return csvRows.join('\n');
}
