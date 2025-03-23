/**
 * Transaction generator module
 * Handles creation of realistic transaction data following Plaid API format
 */

import { 
  Transaction, 
  RemovedTransaction, 
  Account, 
  TransactionLocation, 
  PaymentMeta 
} from "@/types/plaid-types";
import { CompanyProfile } from "@/types/plaid-types";
import { COMMON_VENDORS, INDUSTRY_VENDORS, TRANSACTION_DISTRIBUTIONS } from "./config";

/**
 * Generate a unique transaction ID for use with Plaid API format
 * @returns A string ID in the format expected by Plaid
 */
export function generateTransactionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 22; // Standard Plaid ID length
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generate a date within a specific range
 * @param startDaysAgo Earliest date (days ago from today)
 * @param endDaysAgo Latest date (days ago from today)
 * @returns A date object within the specified range
 */
export function generateDateInRange(startDaysAgo = 730, endDaysAgo = 0): Date {
  const today = new Date();
  const daysAgo = endDaysAgo + Math.floor(Math.random() * (startDaysAgo - endDaysAgo));
  const date = new Date(today);
  date.setDate(today.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Format a date in YYYY-MM-DD format as required by Plaid
 * @param date The date to format
 * @returns A string in YYYY-MM-DD format
 */
export function formatPlaidDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate a realistic transaction location based on merchant
 * @param merchant Name of the merchant
 * @returns Location data in Plaid format
 */
export function generateLocation(merchant: string): TransactionLocation {
  const cities = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", 
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"
  ];
  const regions = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "CA"];
  const postalCodes = ["10001", "90001", "60007", "77001", "85001", "19019", "78201", "92101", "75201", "95101"];
  
  const randomIndex = Math.floor(Math.random() * cities.length);
  
  // For online or digital services, return minimal location info
  if (
    merchant.includes("AWS") || 
    merchant.includes("Azure") || 
    merchant.includes("Cloud") || 
    merchant.includes("Software") || 
    merchant.includes("Digital") || 
    merchant.includes("Subscription") ||
    merchant.includes("Online")
  ) {
    return {
      address: null,
      city: null,
      region: null,
      postal_code: null,
      country: "US",
      lat: null,
      lon: null,
      store_number: null
    };
  }
  
  // For well-known chains, return more specific info
  if (merchant === "Walmart" || merchant === "Target" || merchant === "Costco") {
    return {
      address: `${Math.floor(1000 + Math.random() * 9000)} Commercial Dr`,
      city: cities[randomIndex],
      region: regions[randomIndex],
      postal_code: postalCodes[randomIndex],
      country: "US",
      lat: 30 + Math.random() * 15,
      lon: -120 + Math.random() * 40,
      store_number: `${Math.floor(100 + Math.random() * 900)}`
    };
  }
  
  // For most merchants, return standard location data
  return {
    address: `${Math.floor(100 + Math.random() * 9900)} ${["Main St", "Broadway", "Market St", "Oak Ave", "Maple Dr"][Math.floor(Math.random() * 5)]}`,
    city: cities[randomIndex],
    region: regions[randomIndex],
    postal_code: postalCodes[randomIndex],
    country: "US",
    lat: 30 + Math.random() * 15,
    lon: -120 + Math.random() * 40,
    store_number: Math.random() < 0.3 ? `${Math.floor(10 + Math.random() * 990)}` : null
  };
}

/**
 * Generate payment metadata for a transaction
 * @param type Type of transaction (e.g., ACH, card payment)
 * @returns Payment metadata in Plaid format
 */
export function generatePaymentMeta(type: string): PaymentMeta {
  // For ACH transfers
  if (type === "ACH" || type === "Transfer") {
    return {
      reference_number: `REF${Math.floor(10000000 + Math.random() * 90000000)}`,
      payment_method: "ACH",
      payment_processor: ["ACH Network", "Stripe ACH", "Plaid Transfer"][Math.floor(Math.random() * 3)],
      reason: ["Payment", "Transfer", "Deposit", "Withdrawal"][Math.floor(Math.random() * 4)],
      payee_id: null,
      payer_id: null,
      check_number: null,
      ach_class: ["CCD", "PPD", "WEB", "IAT"][Math.floor(Math.random() * 4)]
    };
  }
  
  // For check payments
  if (type === "Check") {
    return {
      reference_number: null,
      payment_method: "Check",
      payment_processor: null,
      reason: null,
      payee_id: null,
      payer_id: null,
      check_number: `${Math.floor(1000 + Math.random() * 9000)}`,
      ach_class: null
    };
  }
  
  // For credit card payments
  if (type === "Credit Card") {
    return {
      reference_number: `REF${Math.floor(10000000 + Math.random() * 90000000)}`,
      payment_method: "Credit Card",
      payment_processor: ["Visa", "Mastercard", "Amex", "Discover"][Math.floor(Math.random() * 4)],
      reason: null,
      payee_id: null,
      payer_id: null,
      check_number: null,
      ach_class: null
    };
  }
  
  // For wire transfers
  if (type === "Wire") {
    return {
      reference_number: `WIRE${Math.floor(100000 + Math.random() * 900000)}`,
      payment_method: "Wire",
      payment_processor: ["Fedwire", "SWIFT", "CHIPS", "SEPA"][Math.floor(Math.random() * 4)],
      reason: ["Payment", "Transfer", "Deposit", "Settlement"][Math.floor(Math.random() * 4)],
      payee_id: null,
      payer_id: null,
      check_number: null,
      ach_class: null
    };
  }
  
  // Default for most transactions
  return {
    reference_number: null,
    payment_method: null,
    payment_processor: null,
    reason: null,
    payee_id: null,
    payer_id: null,
    check_number: null,
    ach_class: null
  };
}

/**
 * Get a realistic merchant name based on industry
 * @param industry The company's industry
 * @returns A vendor name appropriate for the industry
 */
export function getRealisticMerchant(industry: string): string {
  // Get industry-specific vendors
  const industrySpecificVendors = INDUSTRY_VENDORS[industry as keyof typeof INDUSTRY_VENDORS] || [];
  
  // Combine with common vendors
  const allVendors = [...industrySpecificVendors, ...COMMON_VENDORS];
  
  // Select a random vendor
  return allVendors[Math.floor(Math.random() * allVendors.length)];
}

/**
 * Create a realistic transaction description for a merchant
 * @param merchantName The name of the merchant
 * @param date The transaction date
 * @returns A formatted transaction description
 */
export function createMerchantDescription(merchantName: string, date: Date): string {
  // Common locations for transactions
  const locations = ["NY", "CA", "TX", "IL", "FL", "WA", "MA", "CO", "GA", "OR"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  // Different formatting for different vendors
  if (merchantName.includes("AWS") || merchantName.includes("Amazon")) {
    return `AMZN*${Math.random() < 0.5 ? "AWS" : "SERVICES"} ${location}`;
  } 
  
  if (merchantName.includes("Microsoft")) {
    return `MSFT*${merchantName.includes("Azure") ? "AZURE" : "M365"} ${location}`;
  } 
  
  if (merchantName.includes("Google")) {
    return `GOOGLE*${merchantName.includes("Cloud") ? "CLOUD" : "GSUITE"}`;
  } 
  
  if (merchantName.includes("Adobe")) {
    return "ADOBE*CREATIVE CLD";
  } 
  
  if (merchantName.includes("Slack")) {
    return "SLACK.COM";
  } 
  
  if (merchantName.includes("GitHub")) {
    return "GITHUB.COM";
  } 
  
  if (merchantName.includes("Heroku")) {
    return "HEROKU.COM";
  } 
  
  if (merchantName.includes("Shopify")) {
    return "SHOPIFY*MONTHLY";
  } 
  
  if (merchantName.includes("Square")) {
    return "SQ*SQUARE";
  } 
  
  if (merchantName.includes("UPS")) {
    return "UPS*SHIPPING";
  } 
  
  if (merchantName.includes("FedEx")) {
    return "FEDEX*SHIPPING";
  } 
  
  if (merchantName.includes("Zoom")) {
    return "ZOOM.US";
  } 
  
  if (merchantName.includes("LinkedIn")) {
    return "LINKEDIN*PREMIUM";
  } 
  
  if (merchantName.includes("Uber") || merchantName.includes("Lyft")) {
    return `${merchantName.toUpperCase()}*RIDE ${date.getDate().toString().padStart(2, "0")}${(date.getMonth() + 1)
      .toString().padStart(2, "0")}`;
  } 
  
  if (merchantName.includes("Marriott") || merchantName.includes("Hilton")) {
    return `${merchantName.split(" ")[0].toUpperCase()} HOTELS`;
  } 
  
  if (merchantName.includes("Airlines")) {
    return `${merchantName.split(" ")[0].toUpperCase()} AIR`;
  } 
  
  if (merchantName.includes("Insurance")) {
    return `${merchantName.split(" ")[0].toUpperCase()} INS`;
  } 
  
  if (merchantName.includes("Electric") || merchantName.includes("Utility")) {
    return `${location} POWER & LIGHT`;
  } 
  
  if (merchantName.includes("Water")) {
    return `${location} WATER UTIL`;
  } 
  
  if (merchantName.includes("Rent")) {
    return `COMMERCIAL RENT ${location}`;
  } 
  
  if (merchantName.includes("Janitorial")) {
    return "CLEAN SVCS INC";
  } 
  
  if (merchantName.includes("Coffee")) {
    return "OFFICE COFFEE SVC";
  } 
  
  if (merchantName.includes("Snacks")) {
    return "SNACK DELIVERY SVC";
  } 
  
  if (merchantName.includes("Legal")) {
    return "LEGAL COUNSEL LLC";
  } 
  
  if (merchantName.includes("Accounting")) {
    return "ACCT SERVICES INC";
  }
  
  // For other vendors, create an abbreviated version
  const words = merchantName.split(" ");
  let code = "";
  
  if (words.length === 1) {
    // Single word, take first 5 chars or whole word if shorter
    code = merchantName.substring(0, 5).toUpperCase();
  } else {
    // Multiple words, take first letter or first two letters of each word
    code = words.map((word) => word.substring(0, Math.random() < 0.5 ? 1 : 2).toUpperCase()).join("");
  }
  
  // Add location for most transactions
  if (Math.random() < 0.8) {
    code += ` ${location}`;
  }
  
  // Add reference number for some transactions
  if (Math.random() < 0.4) {
    const refNum = Math.floor(10000 + Math.random() * 90000);
    code += ` REF#${refNum}`;
  }
  
  // Add date code for some transactions
  if (Math.random() < 0.3) {
    code += ` ${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
  }
  
  return code;
}

/**
 * Determine transaction categories based on merchant
 * @param merchantName The name of the merchant
 * @returns An array of categories following Plaid's format
 */
export function determineCategories(merchantName: string): [string[], string] {
  // Software and technology vendors
  if (
    merchantName.includes("AWS") || 
    merchantName.includes("Azure") || 
    merchantName.includes("Google Cloud") || 
    merchantName.includes("Heroku") || 
    merchantName.includes("GitHub") || 
    merchantName.includes("Slack")
  ) {
    return [["Technology", "Software", "Cloud Services"], "10000000"];
  }
  
  // Office utilities
  if (
    merchantName.includes("Microsoft 365") || 
    merchantName.includes("Google Workspace") || 
    merchantName.includes("Zoom") || 
    merchantName.includes("Adobe")
  ) {
    return [["Technology", "Software", "Productivity"], "10100000"];
  }
  
  // Marketing and advertising
  if (
    merchantName.includes("Facebook Ads") || 
    merchantName.includes("Google Ads") || 
    merchantName.includes("Instagram Ads") || 
    merchantName.includes("LinkedIn")
  ) {
    return [["Business Services", "Advertising", "Digital Marketing"], "13000000"];
  }
  
  // Office supplies
  if (
    merchantName.includes("Staples") || 
    merchantName.includes("Office Depot") || 
    merchantName.includes("Amazon Business")
  ) {
    return [["Shops", "Office Supplies"], "19043000"];
  }
  
  // Shipping and logistics
  if (
    merchantName.includes("UPS") || 
    merchantName.includes("FedEx") || 
    merchantName.includes("USPS")
  ) {
    return [["Business Services", "Shipping", "Courier"], "13004000"];
  }
  
  // Utilities
  if (
    merchantName.includes("Electric") || 
    merchantName.includes("Water") || 
    merchantName.includes("Gas")
  ) {
    return [["Service", "Utilities"], "18000000"];
  }
  
  // Telecommunications
  if (
    merchantName.includes("Verizon") || 
    merchantName.includes("AT&T") || 
    merchantName.includes("Comcast") || 
    merchantName.includes("Internet")
  ) {
    return [["Service", "Telecommunications"], "18009000"];
  }
  
  // Rent and facilities
  if (
    merchantName.includes("Rent") || 
    merchantName.includes("Lease") || 
    merchantName.includes("Facilities")
  ) {
    return [["Business Services", "Real Estate"], "13011000"];
  }
  
  // Professional services
  if (
    merchantName.includes("Legal") || 
    merchantName.includes("Accounting") || 
    merchantName.includes("Consulting")
  ) {
    return [["Business Services", "Professional Services"], "13005000"];
  }
  
  // Insurance
  if (merchantName.includes("Insurance")) {
    return [["Business Services", "Insurance"], "13001000"];
  }
  
  // Travel
  if (
    merchantName.includes("Airlines") || 
    merchantName.includes("Hotel") || 
    merchantName.includes("Air") || 
    merchantName.includes("Uber") || 
    merchantName.includes("Lyft")
  ) {
    return [["Travel", "Business Travel"], "22001000"];
  }
  
  // Default for unknown vendors
  return [["Business Services", "Other"], "13000000"];
}

/**
 * Generate a basic transaction
 * @param account The account this transaction belongs to
 * @param merchantName The name of the merchant
 * @param amount Transaction amount (positive for credit, negative for debit)
 * @param date Transaction date
 * @param pending Whether the transaction is pending
 * @returns A transaction in Plaid format
 */
export function generateBaseTransaction(
  account: Account, 
  merchantName: string, 
  amount: number, 
  date: Date, 
  pending = false
): Transaction {
  // Generate a description based on the merchant name
  const merchantDescription = createMerchantDescription(merchantName, date);
  
  // Determine categories based on merchant
  const [categories, categoryId] = determineCategories(merchantName);
  
  // Determine if this has an earlier authorization date
  const hasAuthDate = !pending && Math.random() < 0.7;
  const authDate = hasAuthDate ? new Date(date) : null;
  if (authDate) {
    authDate.setDate(date.getDate() - Math.floor(1 + Math.random() * 2));
  }
  
  // Determine payment method/type
  const paymentType = account.type === "credit" ? "Credit Card" : 
                      Math.random() < 0.7 ? "ACH" : 
                      Math.random() < 0.5 ? "Wire" : "Check";
  
  return {
    transaction_id: generateTransactionId(),
    account_id: account.account_id,
    amount: amount,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    category: categories,
    category_id: categoryId,
    pending: pending,
    pending_transaction_id: null,
    original_description: merchantName,
    merchant_name: merchantName,
    name: merchantDescription,
    date: formatPlaidDate(date),
    authorized_date: authDate ? formatPlaidDate(authDate) : null,
    location: generateLocation(merchantName),
    payment_meta: generatePaymentMeta(paymentType),
    account_owner: null,
    transaction_code: null,
  };
}

/**
 * Generate a deposit transaction (positive amount)
 * @param account The account this transaction belongs to
 * @param profile Company profile for context
 * @param date Optional specific date
 * @returns A deposit transaction in Plaid format
 */
export function generateDepositTransaction(
  account: Account, 
  profile: CompanyProfile, 
  date?: Date
): Transaction {
  // Only generate deposits for depository accounts
  if (account.type !== "depository") {
    throw new Error("Deposits should only be generated for depository accounts");
  }
  
  // Generate a realistic deposit amount based on company size
  const annualRevenue = profile.annual_revenue || 1000000;
  const sizeIndex = {
    "Startup (1-10)": 0,
    "Small (11-50)": 1,
    "Medium (51-200)": 2,
    "Large (201-1000)": 3,
    "Enterprise (1000+)": 4,
  }[profile.company_size] || 0;
  
  // Larger companies have larger but less frequent deposits
  const depositSizes = [
    [500, 5000],     // Startup
    [1000, 20000],   // Small
    [5000, 50000],   // Medium
    [10000, 200000], // Large
    [50000, 500000], // Enterprise
  ];
  
  const [minDeposit, maxDeposit] = depositSizes[sizeIndex];
  const amount = minDeposit + Math.random() * (maxDeposit - minDeposit);
  
  // Generate a realistic date if not provided
  const transactionDate = date || generateDateInRange();
  
  // Common deposit sources
  const depositSources = [
    "Customer Payment",
    "Client Deposit",
    "Invoice Payment",
    "Wire Transfer",
    "ACH Deposit",
    "Check Deposit",
    "Square Transfer",
    "Stripe Payout",
    "PayPal Transfer",
    "Refund",
    "Interest Payment",
  ];
  
  const merchantName = depositSources[Math.floor(Math.random() * depositSources.length)];
  
  return generateBaseTransaction(account, merchantName, amount, transactionDate);
}

/**
 * Generate a payment transaction (negative amount)
 * @param account The account this transaction belongs to
 * @param profile Company profile for context
 * @param category Optional specific expense category
 * @param date Optional specific date
 * @returns A payment transaction in Plaid format
 */
export function generatePaymentTransaction(
  account: Account, 
  profile: CompanyProfile,
  category?: string,
  date?: Date
): Transaction {
  // Generate a merchant based on industry and category
  const industry = profile.industry;
  const merchantName = getRealisticMerchant(industry);
  
  // Generate a realistic payment amount based on company size and merchant
  const annualRevenue = profile.annual_revenue || 1000000;
  const sizeIndex = {
    "Startup (1-10)": 0,
    "Small (11-50)": 1,
    "Medium (51-200)": 2,
    "Large (201-1000)": 3,
    "Enterprise (1000+)": 4,
  }[profile.company_size] || 0;
  
  // Payment ranges by company size
  const paymentSizes = [
    [50, 2000],      // Startup
    [100, 5000],     // Small
    [500, 20000],    // Medium
    [1000, 50000],   // Large
    [5000, 100000],  // Enterprise
  ];
  
  const [minPayment, maxPayment] = paymentSizes[sizeIndex];
  
  // Adjust amount based on merchant type
  let amount: number;
  
  if (merchantName.includes("Rent") || merchantName.includes("Lease")) {
    // Rent is typically a larger expense
    amount = -(minPayment * 3 + Math.random() * (maxPayment * 2 - minPayment * 3));
  } else if (merchantName.includes("AWS") || merchantName.includes("Azure") || merchantName.includes("Google Cloud")) {
    // Cloud services can be expensive for larger companies
    amount = -(minPayment * 1.5 + Math.random() * (maxPayment - minPayment * 1.5));
  } else if (merchantName.includes("Insurance") || merchantName.includes("Health")) {
    // Insurance tends to be a significant expense
    amount = -(minPayment * 2 + Math.random() * (maxPayment - minPayment * 2));
  } else {
    // Standard expense
    amount = -(minPayment + Math.random() * (maxPayment - minPayment));
  }
  
  // Generate a realistic date if not provided
  const transactionDate = date || generateDateInRange();
  
  // Some transactions are pending
  const isPending = Math.random() < 0.05; // 5% chance of being pending
  
  return generateBaseTransaction(account, merchantName, amount, transactionDate, isPending);
}

/**
 * Generate a set of transactions for multiple accounts
 * @param accounts Array of accounts to generate transactions for
 * @param profile Company profile for context
 * @param options Optional configuration options
 * @returns Object containing added, modified, and removed transactions
 */
export function generateTransactionSet(
  accounts: Account[], 
  profile: CompanyProfile,
  options: {
    addedCount?: number;
    modifiedCount?: number;
    removedCount?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}
): { 
  added: Transaction[], 
  modified: Transaction[], 
  removed: RemovedTransaction[] 
} {
  // Determine transaction counts based on company size and options
  const sizeIndex = {
    "Startup (1-10)": 0,
    "Small (11-50)": 1,
    "Medium (51-200)": 2,
    "Large (201-1000)": 3,
    "Enterprise (1000+)": 4,
  }[profile.company_size] || 0;
  
  const baseCounts = [50, 150, 400, 800, 1500]; // By company size
  const baseCount = options.addedCount || baseCounts[sizeIndex];
  
  // Filter for suitable accounts for deposits and payments
  const depositoryAccounts = accounts.filter(a => a.type === "depository");
  const paymentAccounts = accounts.filter(a => a.type === "depository" || a.type === "credit");
  
  // If no suitable accounts, return empty set
  if (depositoryAccounts.length === 0 || paymentAccounts.length === 0) {
    return { added: [], modified: [], removed: [] };
  }
  
  // Generate transactions
  const added: Transaction[] = [];
  
  // Generate deposit transactions (20-30% of all transactions)
  const depositCount = Math.floor(baseCount * (0.2 + Math.random() * 0.1));
  for (let i = 0; i < depositCount; i++) {
    const account = depositoryAccounts[Math.floor(Math.random() * depositoryAccounts.length)];
    const date = generateDateInRange(
      options.startDate ? Math.floor((Date.now() - options.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 730,
      options.endDate ? Math.floor((Date.now() - options.endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
    );
    added.push(generateDepositTransaction(account, profile, date));
  }
  
  // Generate payment transactions (70-80% of all transactions)
  const paymentCount = baseCount - depositCount;
  for (let i = 0; i < paymentCount; i++) {
    const account = paymentAccounts[Math.floor(Math.random() * paymentAccounts.length)];
    const date = generateDateInRange(
      options.startDate ? Math.floor((Date.now() - options.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 730,
      options.endDate ? Math.floor((Date.now() - options.endDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
    );
    added.push(generatePaymentTransaction(account, profile, undefined, date));
  }
  
  // Sort transactions by date (newest first)
  added.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Generate modified transactions (updates to existing transactions)
  const modified: Transaction[] = [];
  const modifiedCount = options.modifiedCount || Math.floor(baseCount * 0.05); // 5% of transactions are modified
  
  // Pick random transactions to modify
  for (let i = 0; i < modifiedCount && i < added.length; i++) {
    const transactionToModify = { ...added[Math.floor(Math.random() * added.length)] };
    
    // Make a small change to the transaction (e.g., amount, category)
    const modType = Math.floor(Math.random() * 3);
    if (modType === 0) {
      // Modify amount slightly
      transactionToModify.amount = transactionToModify.amount * (0.95 + Math.random() * 0.1);
    } else if (modType === 1) {
      // Change pending status
      transactionToModify.pending = !transactionToModify.pending;
    } else {
      // Update category
      const [categories, categoryId] = determineCategories(transactionToModify.merchant_name || "");
      transactionToModify.category = categories;
      transactionToModify.category_id = categoryId;
    }
    
    modified.push(transactionToModify);
  }
  
  // Generate removed transactions (transactions that no longer appear)
  const removed: RemovedTransaction[] = [];
  const removedCount = options.removedCount || Math.floor(baseCount * 0.02); // 2% of transactions are removed
  
  // Pick random transactions to remove
  for (let i = 0; i < removedCount && i < added.length; i++) {
    const transactionToRemove = added[Math.floor(Math.random() * added.length)];
    
    removed.push({
      transaction_id: transactionToRemove.transaction_id,
      account_id: transactionToRemove.account_id
    });
  }
  
  return { added, modified, removed };
}
