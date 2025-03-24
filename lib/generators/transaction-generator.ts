/**
 * Transaction generator module
 * Handles creation of realistic transaction data following Plaid API format
 */

import { 
  Transaction, 
  RemovedTransaction, 
  Account, 
  TransactionLocation, 
  PaymentMeta,
  Counterparty,
  PersonalFinanceCategory
} from "@/types/plaid-types";
import { CompanyProfile } from "@/types/plaid-types";
import { COMMON_VENDORS, INDUSTRY_VENDORS, TRANSACTION_DISTRIBUTIONS } from "./config";

/**
 * Merchant name styles for realistic transaction descriptions
 * Format: [category]: [[merchantName, descriptionPattern], ...]
 * Description patterns can include placeholders:
 * {date} - formatted date MM/DD
 * {random} - random 4-digit number
 * {location} - company location city
 * {client} - company name without spaces
 * {service} - service name for subscription services
 */
const MERCHANT_NAME_STYLES: Record<string, Array<[string, string]>> = {
  // Restaurant and food services
  "restaurant": [
    ["Uber Eats", "UBER EATS {date} {random} {location}"],
    ["DoorDash", "DOORDASH {random} {location}"],
    ["Grubhub", "GRUBHUB {date} {random}"],
    ["Starbucks", "STARBUCKS CARD {random} {location}"],
    ["Chipotle", "CHIPOTLE {random} {location}, CA"],
    ["McDonald's", "MCDONALD'S #{random} {location}"]
  ],
  
  // Travel and transportation
  "travel": [
    ["Uber", "UBER *TRIP {random} {location}"],
    ["Lyft", "LYFT *RIDE {date} {random}"],
    ["Delta", "DELTA AIR {random} TICKET"],
    ["American Airlines", "AMERICAN AIR {random} TICKET"],
    ["Southwest", "SOUTHWEST AIR {random}"],
    ["United", "UNITED AIR {random} TICKET"],
    ["Marriott", "MARRIOTT {location} {random}"],
    ["Hilton", "HILTON HOTELS {location}"]
  ],
  
  // Software and cloud services
  "software": [
    ["GitHub", "GITHUB.COM {service} {date}"],
    ["Slack", "SLACK.COM {service} {date}"],
    ["Zoom", "ZOOM.US {random} {service}"],
    ["Google", "GOOGLE {service} {client}"],
    ["Microsoft", "MICROSOFT {service} {random}"],
    ["Adobe", "ADOBE {service} SUBSCRIPTION"],
    ["AWS", "AMAZON WEB SERVICES {random}"],
    ["DigitalOcean", "DIGITALOCEAN.COM {random}"],
    ["Heroku", "HEROKU {random} {client}"]
  ],
  
  // Utilities and telecommunications
  "utilities": [
    ["AT&T", "AT&T {service} {random}"],
    ["Verizon", "VERIZON WIRELESS {random}"],
    ["Comcast", "COMCAST {service} {random}"],
    ["PG&E", "PG&E ELECTRIC {date} {random}"],
    ["Edison", "SO CAL EDISON {random}"],
    ["Water", "WATER UTILITY {location} {random}"]
  ],
  
  // Marketing and advertising
  "marketing": [
    ["Facebook Ads", "FB *ADS {random} {client}"],
    ["Google Ads", "GOOGLE ADS {random} {client}"],
    ["LinkedIn Ads", "LINKEDIN {random} ADS"],
    ["Twitter Ads", "TWITTER ADS {random}"],
    ["Mailchimp", "MAILCHIMP.COM {random} {client}"],
    ["Hubspot", "HUBSPOT {service} {date}"]
  ],
  
  // Office supplies and services
  "office": [
    ["Staples", "STAPLES #{random} {location}"],
    ["Office Depot", "OFFICE DEPOT #{random}"],
    ["Amazon Business", "AMZN MKTP US*{random}"],
    ["UPS", "UPS {random} SHIPPING"],
    ["FedEx", "FEDEX {random} {location}"],
    ["USPS", "USPS PO {random} {location}"]
  ],
  
  // Insurance and financial services
  "insurance": [
    ["State Farm", "STATE FARM INS {random}"],
    ["Geico", "GEICO INS PAYMENT {random}"],
    ["Blue Cross", "BCBS INSURANCE {date}"],
    ["Kaiser", "KAISER HEALTH {random}"],
    ["Aetna", "AETNA INS {random} {date}"],
    ["Fidelity", "FIDELITY INV {random}"]
  ],
  
  // Deposits and income
  "deposits": [
    ["Stripe", "STRIPE {random} {client}"],
    ["PayPal", "PAYPAL *{client} {random}"],
    ["Square", "SQ *{client} {random}"],
    ["ACH Deposit", "ACH DEPOSIT {client} {random}"],
    ["Wire Transfer", "WIRE TRANSFER {client} {date}"],
    ["Venmo", "VENMO PAYMENT {random}"]
  ]
};

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
      payee: null,
      payer: null,
      by_order_of: null,
      ppd_id: null
    };
  }
  
  // For check payments
  if (type === "Check") {
    return {
      reference_number: null,
      payment_method: "Check",
      payment_processor: null,
      reason: null,
      payee: null,
      payer: null,
      by_order_of: null,
      ppd_id: `${Math.floor(1000 + Math.random() * 9000)}`
    };
  }
  
  // For credit card payments
  if (type === "Credit Card") {
    return {
      reference_number: `REF${Math.floor(10000000 + Math.random() * 90000000)}`,
      payment_method: "Credit Card",
      payment_processor: ["Visa", "Mastercard", "Amex", "Discover"][Math.floor(Math.random() * 4)],
      reason: null,
      payee: null,
      payer: null,
      by_order_of: null,
      ppd_id: null
    };
  }
  
  // For wire transfers
  if (type === "Wire") {
    return {
      reference_number: `WIRE${Math.floor(100000 + Math.random() * 900000)}`,
      payment_method: "Wire",
      payment_processor: ["Fedwire", "SWIFT", "CHIPS", "SEPA"][Math.floor(Math.random() * 4)],
      reason: ["Payment", "Transfer", "Deposit", "Settlement"][Math.floor(Math.random() * 4)],
      payee: null,
      payer: null,
      by_order_of: null,
      ppd_id: null
    };
  }
  
  // Default for most transactions
  return {
    reference_number: null,
    payment_method: null,
    payment_processor: null,
    reason: null,
    payee: null,
    payer: null,
    by_order_of: null,
    ppd_id: null
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
 * @returns An object containing categories and category ID following Plaid's format
 */
function determineCategories(merchantName: string): { categories: string[], categoryId: string } {
  // For restaurants and food
  if (
    merchantName.includes("Restaurant") || 
    merchantName.includes("Dining") || 
    merchantName.includes("Food") || 
    merchantName.includes("Starbucks") || 
    merchantName.includes("Chipotle") || 
    merchantName.includes("McDonald's") ||
    merchantName.includes("Uber Eats") ||
    merchantName.includes("DoorDash")
  ) {
    return { 
      categories: ["Food and Drink", "Restaurants"],
      categoryId: "13005000" 
    };
  }
  
  // Cloud services
  if (
    merchantName.includes("AWS") || 
    merchantName.includes("Azure") || 
    merchantName.includes("Google Cloud") ||
    merchantName.includes("Digital Ocean") ||
    merchantName.includes("Heroku")
  ) {
    return { 
      categories: ["Business Services", "Cloud Computing"],
      categoryId: "10002000" 
    };
  }
  
  // Software and subscriptions
  if (
    merchantName.includes("GitHub") || 
    merchantName.includes("Slack") || 
    merchantName.includes("Zoom") || 
    merchantName.includes("Adobe") || 
    merchantName.includes("Microsoft")
  ) {
    return { 
      categories: ["Technology", "Software", "Productivity"],
      categoryId: "10100000" 
    };
  }
  
  // Marketing and advertising
  if (
    merchantName.includes("Facebook Ads") || 
    merchantName.includes("Google Ads") || 
    merchantName.includes("Instagram Ads") || 
    merchantName.includes("LinkedIn")
  ) {
    return { 
      categories: ["Business Services", "Advertising", "Digital Marketing"],
      categoryId: "13000000" 
    };
  }
  
  // Office supplies
  if (
    merchantName.includes("Staples") || 
    merchantName.includes("Office Depot") || 
    merchantName.includes("Amazon Business")
  ) {
    return { 
      categories: ["Shops", "Office Supplies"],
      categoryId: "19043000" 
    };
  }
  
  // Shipping and logistics
  if (
    merchantName.includes("UPS") || 
    merchantName.includes("FedEx") || 
    merchantName.includes("USPS")
  ) {
    return { 
      categories: ["Business Services", "Shipping", "Courier"],
      categoryId: "13004000" 
    };
  }
  
  // Utilities
  if (
    merchantName.includes("Electric") || 
    merchantName.includes("Water") || 
    merchantName.includes("Gas")
  ) {
    return { 
      categories: ["Service", "Utilities"],
      categoryId: "18000000" 
    };
  }
  
  // Telecommunications
  if (
    merchantName.includes("Verizon") || 
    merchantName.includes("AT&T") || 
    merchantName.includes("Comcast") || 
    merchantName.includes("Internet")
  ) {
    return { 
      categories: ["Service", "Telecommunications"],
      categoryId: "18009000" 
    };
  }
  
  // Rent and facilities
  if (
    merchantName.includes("Rent") || 
    merchantName.includes("Lease") || 
    merchantName.includes("Facilities")
  ) {
    return { 
      categories: ["Business Services", "Real Estate"],
      categoryId: "13011000" 
    };
  }
  
  // Professional services
  if (
    merchantName.includes("Legal") || 
    merchantName.includes("Accounting") || 
    merchantName.includes("Consulting")
  ) {
    return { 
      categories: ["Business Services", "Professional Services"],
      categoryId: "13005000" 
    };
  }
  
  // Insurance
  if (merchantName.includes("Insurance")) {
    return { 
      categories: ["Business Services", "Insurance"],
      categoryId: "13001000" 
    };
  }
  
  // Travel
  if (
    merchantName.includes("Airlines") || 
    merchantName.includes("Hotel") || 
    merchantName.includes("Air") || 
    merchantName.includes("Uber") || 
    merchantName.includes("Lyft")
  ) {
    return { 
      categories: ["Travel", "Business Travel"],
      categoryId: "22001000" 
    };
  }
  
  // Default for unknown vendors
  return { 
    categories: ["Business Services", "Other"],
    categoryId: "13000000" 
  };
}

/**
 * Helper function to get company size index (0-4) from profile
 * @param companySize Company size string from profile
 * @returns Index from 0 (smallest) to 4 (largest)
 */
function getSizeIndex(companySize: string): number {
  return {
    "Startup (1-10)": 0,
    "Small (11-50)": 1,
    "Medium (51-200)": 2,
    "Large (201-1000)": 3,
    "Enterprise (1000+)": 4,
  }[companySize] || 0;
}

/**
 * Generate a basic transaction
 * @param account The account this transaction belongs to
 * @param merchantName The name of the merchant
 * @param amount The transaction amount (positive for deposits, negative for payments)
 * @param date The transaction date
 * @param profile Company profile for context (optional)
 * @returns A transaction object in Plaid API format
 */
export function generateBaseTransaction(
  account: Account,
  merchantName: string,
  amount: number,
  date: Date,
  profile?: CompanyProfile
): Transaction {
  // Determine if transaction is pending (10% chance)
  const pending = Math.random() < 0.1;
  
  // For pending transactions, set auth date to transaction date
  // For posted transactions, auth date is 0-3 days before transaction date
  const daysBeforeAuth = pending ? 0 : Math.floor(Math.random() * 3);
  const authDate = new Date(date);
  authDate.setDate(authDate.getDate() - daysBeforeAuth);
  
  // Get realistic merchant details
  let merchantDescription = merchantName;
  
  if (profile) {
    const formattedDetails = formatMerchantDetails(merchantName, date, profile);
    merchantName = formattedDetails.merchantName;
    merchantDescription = formattedDetails.description;
  }
  
  // Get category and category ID based on merchant name
  const { categories, categoryId } = determineCategories(merchantName);
  
  // Generate transaction ID
  const transactionId = generateTransactionId();
  
  // Create payment meta based on transaction type (payment vs deposit)
  const paymentType = amount < 0 ? "payment" : "deposit";
  
  // Create a realistic counterparty object based on merchant
  const counterparties: Counterparty[] = [{
    name: merchantName,
    type: "merchant",
    entity_id: `O${Math.random().toString(36).substring(2, 14)}`,
    confidence_level: "VERY_HIGH",
    logo_url: null,
    website: null
  }];
  
  // Generate a personal finance category for consumer analysis
  const personalFinanceCategory: PersonalFinanceCategory = {
    primary: categories[0],
    detailed: categories.length > 1 ? categories[1] : categories[0],
    confidence_level: "VERY_HIGH"
  };
  
  // Build the transaction with all required fields
  return {
    transaction_id: transactionId,
    account_id: account.account_id,
    amount: amount,
    iso_currency_code: "USD",
    unofficial_currency_code: null,
    category: categories,
    category_id: categoryId,
    pending: pending,
    pending_transaction_id: null,
    merchant_name: merchantName,
    name: merchantDescription,
    date: formatPlaidDate(date),
    authorized_date: authDate ? formatPlaidDate(authDate) : null,
    location: generateLocation(merchantName),
    payment_meta: generatePaymentMeta(paymentType),
    account_owner: null,
    transaction_code: null,
    counterparties: counterparties,
    personal_finance_category: personalFinanceCategory
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
  // Define deposit sizes based on company size 
  const depositSizes = [
    [300, 2000],    // Startup
    [500, 3000],    // Small
    [1000, 5000],   // Medium
    [2000, 8000],   // Large
    [5000, 15000],  // Enterprise
  ];
  
  // Get the appropriate size ranges for this company
  const sizeIndex = getSizeIndex(profile.company_size);
  const [minDeposit, maxDeposit] = depositSizes[sizeIndex];
  
  // Common deposit sources
  const depositSources = [
    "Client Payment",
    "Client Deposit",
    "Invoice Payment",
    "Wire Transfer",
    "Stripe",
    "PayPal",
    "Square",
    "ACH Deposit",
    "Venmo",
    "Accounts Receivable",
    "Contract Payment",
    "Refund"
  ];
  
  // Choose a random deposit source
  const sourceIndex = Math.floor(Math.random() * depositSources.length);
  const merchantName = depositSources[sourceIndex];
  
  // Generate a more realistic deposit amount 
  let amount: number;
  
  // Business model affects deposit size patterns
  if (profile.business_model === "E-commerce" || profile.business_model === "SaaS") {
    // More frequent, smaller deposits
    if (Math.random() < 0.7) {
      // Typical transaction
      amount = minDeposit * 0.5 + Math.random() * (maxDeposit * 0.3);
    } else {
      // Occasional larger deposit
      amount = minDeposit + Math.random() * (maxDeposit - minDeposit);
    }
  } else if (profile.business_model === "Consulting" || profile.business_model === "Agency") {
    // Less frequent, larger retainer or project-based deposits
    if (Math.random() < 0.3) {
      // Small deposit (expense reimbursement, etc)
      amount = minDeposit * 0.3 + Math.random() * (minDeposit * 0.7);
    } else {
      // Large project payment
      amount = minDeposit * 0.8 + Math.random() * (maxDeposit - (minDeposit * 0.8));
    }
  } else {
    // Standard distribution
    amount = minDeposit + Math.random() * (maxDeposit - minDeposit);
  }
  
  // Most deposits end in round numbers for businesses
  amount = Math.round(amount);
  
  // Generate a realistic date if not provided
  const transactionDate = date || generateDateInRange();
  
  return generateBaseTransaction(account, merchantName, amount, transactionDate, profile);
}

/**
 * Generate a payment transaction (negative amount)
 * @param account The account this transaction belongs to
 * @param merchantName The name of the merchant
 * @param date Optional transaction date (generates if not provided)
 * @param profile Company profile for context and realistic amounts
 * @returns A transaction object in Plaid API format
 */
export function generatePaymentTransaction(
  account: Account,
  merchantName: string,
  date?: Date,
  profile?: CompanyProfile
): Transaction {
  // Generate payment amounts based on merchant type and company size
  const sizeIndex = profile ? getSizeIndex(profile.company_size) : 0;
  
  // Define standard payment ranges by company size and merchant type
  const paymentRanges: Record<string, number[][]> = {
    // Software subscriptions - scales with company size
    software: [
      [-50, -200],    // Startup
      [-100, -500],   // Small
      [-200, -1000],  // Medium
      [-500, -3000],  // Large
      [-1000, -8000], // Enterprise
    ],
    // Cloud services - scales significantly with company size
    cloud: [
      [-100, -500],    // Startup
      [-200, -1500],   // Small
      [-1000, -5000],  // Medium
      [-3000, -15000], // Large
      [-8000, -50000], // Enterprise
    ],
    // Office supplies - moderate scaling with company size
    office: [
      [-30, -200],   // Startup
      [-50, -500],   // Small
      [-100, -1000], // Medium
      [-300, -2000], // Large
      [-500, -5000], // Enterprise
    ],
    // Utilities - moderate scaling with company size
    utilities: [
      [-50, -300],   // Startup
      [-100, -500],  // Small
      [-200, -800],  // Medium
      [-300, -1500], // Large
      [-500, -3000], // Enterprise
    ],
    // Marketing - scales significantly with company size
    marketing: [
      [-100, -500],    // Startup
      [-300, -2000],   // Small
      [-1000, -5000],  // Medium
      [-2000, -10000], // Large
      [-5000, -30000], // Enterprise
    ],
    // Default for other merchant types
    default: [
      [-20, -200],   // Startup
      [-50, -500],   // Small
      [-100, -1000], // Medium
      [-200, -2000], // Large
      [-500, -5000], // Enterprise
    ]
  };
  
  // Determine merchant type for payment amount scaling
  let merchantType = "default";
  const lowerMerchant = merchantName.toLowerCase();
  
  if (
    lowerMerchant.includes("aws") || 
    lowerMerchant.includes("azure") || 
    lowerMerchant.includes("google cloud") || 
    lowerMerchant.includes("digitalocean") || 
    lowerMerchant.includes("heroku")
  ) {
    merchantType = "cloud";
  } 
  else if (
    lowerMerchant.includes("github") || 
    lowerMerchant.includes("slack") || 
    lowerMerchant.includes("zoom") || 
    lowerMerchant.includes("adobe") || 
    lowerMerchant.includes("microsoft")
  ) {
    merchantType = "software";
  }
  else if (
    lowerMerchant.includes("staples") || 
    lowerMerchant.includes("office") || 
    lowerMerchant.includes("amazon")
  ) {
    merchantType = "office";
  }
  else if (
    lowerMerchant.includes("electric") || 
    lowerMerchant.includes("pg&e") || 
    lowerMerchant.includes("at&t") || 
    lowerMerchant.includes("verizon") || 
    lowerMerchant.includes("comcast") || 
    lowerMerchant.includes("water")
  ) {
    merchantType = "utilities";
  }
  else if (
    lowerMerchant.includes("facebook") || 
    lowerMerchant.includes("google ads") || 
    lowerMerchant.includes("instagram") || 
    lowerMerchant.includes("linkedin") || 
    lowerMerchant.includes("twitter") || 
    lowerMerchant.includes("mailchimp") || 
    lowerMerchant.includes("hubspot")
  ) {
    merchantType = "marketing";
  }
  
  // Get range based on merchant type and company size
  const ranges = paymentRanges[merchantType] || paymentRanges.default;
  const [min, max] = ranges[sizeIndex];
  
  // Generate an amount in the appropriate range
  const amount = min + Math.random() * (max - min);
  
  // Generate a realistic date if not provided
  const transactionDate = date || generateDateInRange();
  
  return generateBaseTransaction(account, merchantName, amount, transactionDate, profile);
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
  const sizeIndex = getSizeIndex(profile.company_size);
  
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
    added.push(generatePaymentTransaction(account, getRealisticMerchant(profile.industry), date, profile));
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
      const { categories, categoryId } = determineCategories(transactionToModify.merchant_name || "");
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

/**
 * Format a transaction description using realistic patterns
 * @param merchantName The name of the merchant
 * @param transactionDate The date of the transaction
 * @param profile Company profile information for context
 * @returns Object containing formatted merchant name and description
 */
function formatMerchantDetails(
  merchantName: string, 
  transactionDate: Date,
  profile: CompanyProfile
): { merchantName: string, description: string } {
  // First try to find an exact match in our merchant styles
  for (const [category, merchants] of Object.entries(MERCHANT_NAME_STYLES)) {
    for (const [name, pattern] of merchants) {
      if (merchantName.includes(name)) {
        // We found a matching merchant - format its description
        const dateStr = transactionDate.toISOString().substring(5, 10).replace("-", "/");
        const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        const location = profile.location?.split(',')[0] || "San Francisco";
        const client = profile.company_name?.replace(/\W+/g, '') || "CLIENT";
        
        // For software or cloud services, add a specific service name
        const services: Record<string, string[]> = {
          "Google": ["WORKSPACE", "CLOUD", "DRIVE", "GSUITE"],
          "Microsoft": ["AZURE", "O365", "M365"],
          "Adobe": ["CREATIVE", "ACROBAT", "PHOTOSHOP"],
          "AT&T": ["INTERNET", "WIRELESS", "BUSINESS"],
          "Comcast": ["CABLE", "BUSINESS", "INTERNET"]
        };
        
        const serviceProvider = Object.keys(services).find(s => name.includes(s));
        const service = serviceProvider && services[serviceProvider] ? 
          services[serviceProvider][Math.floor(Math.random() * services[serviceProvider].length)] : 
          "SERVICE";
        
        // Format the description by replacing placeholders
        let description = pattern
          .replace("{date}", dateStr)
          .replace("{random}", randomNum)
          .replace("{location}", location)
          .replace("{client}", client)
          .replace("{service}", service);
        
        return { merchantName: name, description };
      }
    }
  }
  
  // If no exact match was found, create a generic formatted description
  const shortName = merchantName.toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ');
  return { 
    merchantName, 
    description: `${shortName} ${profile.location?.split(',')[0] || ""}`.trim()
  };
}
