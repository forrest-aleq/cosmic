/**
 * Configuration data for financial data generation
 * Contains industry-specific vendors, transaction category distributions,
 * and other configuration used for realistic financial data generation
 */

/**
 * Bank options for account generation
 * Maps bank names to their typical account offerings and characteristics
 */
export const BANK_OPTIONS = {
  "Chase": {
    businessChecking: ["Business Complete Checking", "Performance Business Checking", "Platinum Business Checking"],
    businessSavings: ["Business Premier Savings", "Business Total Savings"],
    creditCards: ["Ink Business Preferred", "Ink Business Cash", "Ink Business Unlimited"],
    loanOptions: ["SBA Loans", "Business Lines of Credit", "Commercial Real Estate Loans"],
    routingNumberPrefixes: ["021", "267", "322", "325"],
  },
  "Bank of America": {
    businessChecking: ["Business Advantage Fundamentals", "Business Advantage Relationship"],
    businessSavings: ["Business Advantage Savings", "Business Investment Account"],
    creditCards: ["Business Advantage Cash Rewards", "Business Advantage Travel Rewards"],
    loanOptions: ["Business Advantage Term Loans", "Business Advantage Line of Credit"],
    routingNumberPrefixes: ["051", "053", "063", "121"],
  },
  "Wells Fargo": {
    businessChecking: ["Initiate Business Checking", "Navigate Business Checking", "Optimize Business Checking"],
    businessSavings: ["Business Market Rate Savings", "Business Platinum Savings"],
    creditCards: ["Business Platinum", "Business Elite", "Business Secured"],
    loanOptions: ["Equipment Express Loan", "BusinessLoan Term Loan", "FastFlex Small Business Loan"],
    routingNumberPrefixes: ["121", "122", "123", "125"],
  },
  "Citibank": {
    businessChecking: ["CitiBusiness Streamlined Checking", "CitiBusiness Flexible Checking"],
    businessSavings: ["CitiBusiness Savings", "CitiBusiness Insured Money Market Account"],
    creditCards: ["Costco Anywhere Visa Business", "CitiBusiness AAdvantage Platinum Select"],
    loanOptions: ["Commercial Mortgages", "Term Loans", "SBA Loans"],
    routingNumberPrefixes: ["021", "031", "271", "321"],
  },
  "Capital One": {
    businessChecking: ["Basic Business Checking", "Unlimited Business Checking"],
    businessSavings: ["Business Advantage Savings", "Business Money Market Account"],
    creditCards: ["Spark Cash Plus", "Spark Cash Select", "Spark Miles"],
    loanOptions: ["Small Business Loans", "Business Installment Loans", "Lines of Credit"],
    routingNumberPrefixes: ["051", "056", "065", "255"],
  },
  "TD Bank": {
    businessChecking: ["Business Convenience Checking", "Business Value Checking", "Business Premier Checking"],
    businessSavings: ["Business Savings", "Business Money Market"],
    creditCards: ["Business Solutions", "Business Convenience Plus", "Business Premier"],
    loanOptions: ["Small Business Loans", "Business Lines of Credit", "Equipment Financing"],
    routingNumberPrefixes: ["011", "031", "036", "053"],
  },
  "PNC Bank": {
    businessChecking: ["Business Checking", "Business Checking Plus", "Analysis Business Checking"],
    businessSavings: ["Standard Business Savings", "Premiere Business Money Market"],
    creditCards: ["PNC Cash Rewards Visa", "PNC Points Visa", "PNC Visa Business"],
    loanOptions: ["Term Loans", "Equipment Loans", "SBA Loans"],
    routingNumberPrefixes: ["031", "041", "043", "071"],
  },
  "US Bank": {
    businessChecking: ["Silver Business Checking", "Gold Business Checking", "Platinum Business Checking"],
    businessSavings: ["Business Savings", "Business Premium Money Market"],
    creditCards: ["Business Leverage Visa", "Business Cash Rewards", "Business Platinum"],
    loanOptions: ["Quick Loan", "Lines of Credit", "Practice Financing"],
    routingNumberPrefixes: ["041", "042", "081", "082"],
  },
};

/**
 * Common vendors shared across all industries
 */
export const COMMON_VENDORS = [
  "Amazon Business",
  "Staples",
  "Office Depot",
  "UPS",
  "FedEx",
  "USPS",
  "Microsoft 365",
  "Google Workspace",
  "QuickBooks",
  "Zoom",
  "Adobe",
  "Verizon",
  "AT&T",
  "Comcast Business",
  "Electric Company",
  "Water Utility",
  "Commercial Rent",
  "Janitorial Services",
  "City Business License",
  "State Filing Fee",
  "HR Software",
  "Payroll Services",
  "Health Insurance",
  "Office Snacks",
  "Coffee Service",
  "IT Support",
  "Cybersecurity Services",
  "Legal Services",
  "Accounting Services",
];

/**
 * Industry-specific vendors for realistic transaction generation
 */
export const INDUSTRY_VENDORS = {
  "Technology": [
    "AWS",
    "Microsoft Azure", 
    "Google Cloud",
    "Adobe Creative Cloud",
    "Slack",
    "GitHub",
    "JetBrains",
    "Digital Ocean",
    "Mailchimp",
    "Asana",
    "Atlassian",
    "MongoDB Atlas",
    "Heroku",
    "Cloudflare",
    "Twilio",
    "SendGrid",
    "New Relic",
    "DataDog",
    "Docker",
  ],
  "Retail": [
    "Shopify",
    "Square",
    "Inventory Management Software",
    "Point of Sale System",
    "Shopping Bags Supplier",
    "Store Fixtures",
    "Facebook Ads",
    "Google Ads",
    "Instagram Ads",
    "Packaging Suppliers",
    "Shopping Malls Ltd",
    "Display Fixtures Co",
    "Visual Merchandising Inc",
    "Retail Space Leasing",
    "Security Systems",
  ],
  "Healthcare": [
    "Electronic Health Records",
    "Medical Suppliers Co",
    "Insurance Providers",
    "Medical Equipment Corp",
    "Healthcare Software Inc",
    "Sterilization Services",
    "Professional Medical Associations",
    "Pharmaceutical Distributors",
    "Lab Testing Services",
    "Patient Management Systems",
    "Medical Waste Disposal",
    "Compliance Training",
  ],
  "Financial Services": [
    "Bloomberg Terminal",
    "Thomson Reuters",
    "Financial Information Exchange",
    "Trading Software",
    "Compliance Systems",
    "Risk Management Software",
    "Financial Planning Software",
    "Payment Processors",
    "Credit Bureau Services",
    "Investment Research Tools",
    "Anti-Money Laundering Software",
  ],
  "Manufacturing": [
    "Steel Suppliers Inc",
    "Machinery Parts Co",
    "Factory Equipment Ltd",
    "Industrial Supplies",
    "Shipping Partners",
    "Packaging Solutions",
    "Maintenance Services",
    "Quality Control Systems",
    "Raw Materials Distributors",
    "Warehouse Leasing",
    "Forklift Rentals",
    "Safety Equipment",
  ],
  "Consulting": [
    "American Airlines",
    "Delta",
    "Marriott",
    "Hilton",
    "Uber",
    "Lyft",
    "Coursera",
    "Udemy",
    "WeWork",
    "Professional Certifications",
    "LinkedIn Premium",
    "Conference Registration",
    "Professional Association Dues",
    "Client Entertainment",
  ],
  "Real Estate": [
    "Property Management Software",
    "Listing Services",
    "CRM for Real Estate",
    "Professional Photography",
    "Virtual Tour Software",
    "Home Inspection Services",
    "Title Insurance",
    "Real Estate Marketing Services",
    "Landscaping Services",
    "Renovation Contractors",
  ],
  "Education": [
    "Learning Management System",
    "Textbook Publishers",
    "Educational Software",
    "Library Resources",
    "Student Information System",
    "Campus Management Software",
    "Educational Assessment Tools",
    "Online Learning Platforms",
    "Student Recruitment Services",
    "Accreditation Fees",
  ],
  "Hospitality": [
    "Booking Software",
    "Hotel Supplies",
    "Food Suppliers",
    "Beverage Distributors",
    "Linen Services",
    "Cleaning Services",
    "Reservation Systems",
    "Point of Sale for Restaurants",
    "Guest Amenities",
    "Entertainment Services",
  ],
  "Media & Entertainment": [
    "Adobe Creative Cloud",
    "Camera Equipment",
    "Audio Equipment",
    "Editing Software",
    "Stock Media Services",
    "Talent Agencies",
    "Production Insurance",
    "Streaming Services",
    "Licensing Fees",
    "Studio Rentals",
  ],
};

/**
 * Transaction category distributions by industry
 * Defines the relative frequency of different transaction types
 */
export const TRANSACTION_DISTRIBUTIONS = {
  "Technology": {
    "Software & Cloud Services": 25,
    "Office Rent": 15,
    "Employee Compensation": 35,
    "Marketing & Advertising": 10,
    "Travel & Entertainment": 5,
    "Office Supplies & Equipment": 5,
    "Professional Services": 5,
  },
  "Retail": {
    "Inventory Purchases": 40,
    "Store Rent": 15,
    "Employee Compensation": 20,
    "Marketing & Advertising": 10,
    "Supplies & Equipment": 5,
    "Utilities & Services": 5,
    "Shipping & Logistics": 5,
  },
  "Healthcare": {
    "Medical Supplies": 25,
    "Facility Costs": 20,
    "Staff Compensation": 35,
    "Insurance & Compliance": 10,
    "Equipment Maintenance": 5,
    "Professional Development": 5,
  },
  "Financial Services": {
    "Technology & Data Services": 20,
    "Office Space": 15,
    "Employee Compensation": 40,
    "Compliance & Legal": 10,
    "Professional Services": 10,
    "Marketing & Client Acquisition": 5,
  },
  "Manufacturing": {
    "Raw Materials": 35,
    "Equipment & Maintenance": 15,
    "Labor": 25,
    "Facility Costs": 10,
    "Utilities": 5,
    "Shipping & Logistics": 10,
  },
  "Consulting": {
    "Employee Compensation": 50,
    "Travel & Entertainment": 15,
    "Office Rent": 10,
    "Technology & Software": 10,
    "Marketing & Business Development": 10,
    "Professional Development": 5,
  },
};

/**
 * Transaction frequency patterns for realistic recurring transactions
 */
export const RECURRING_TRANSACTION_PATTERNS = {
  "Monthly": {
    dayOfMonth: [1, 5, 10, 15, 20, 25, 28], // Common billing days
    variance: 0, // No variance for most monthly bills
  },
  "Biweekly": {
    daysApart: 14,
    variance: 1, // +/- 1 day variance
  },
  "Weekly": {
    dayOfWeek: [1, 5], // Monday or Friday
    variance: 0,
  },
  "Quarterly": {
    months: [0, 3, 6, 9], // Jan, Apr, Jul, Oct
    dayOfMonth: [1, 15],
    variance: 2, // +/- 2 days
  },
  "Annual": {
    months: [0, 6], // January or July
    dayOfMonth: [1, 15],
    variance: 5, // +/- 5 days
  },
};

/**
 * Seasonal spending patterns to add realism to transaction history
 */
export const SEASONAL_PATTERNS = {
  "Q1": { // Jan-Mar
    "Marketing & Advertising": 1.2, // Higher at start of year
    "Travel & Entertainment": 0.8, // Lower in winter
    "Office Supplies & Equipment": 1.1, // Slight increase for new year
  },
  "Q2": { // Apr-Jun
    "Marketing & Advertising": 1.0, // Normal
    "Travel & Entertainment": 1.1, // Increasing
    "Office Supplies & Equipment": 1.0, // Normal
  },
  "Q3": { // Jul-Sep
    "Marketing & Advertising": 0.9, // Summer slowdown
    "Travel & Entertainment": 1.3, // Summer travel
    "Office Supplies & Equipment": 0.9, // Slight decrease
  },
  "Q4": { // Oct-Dec
    "Marketing & Advertising": 1.3, // Holiday increase
    "Travel & Entertainment": 1.2, // Holiday parties
    "Office Supplies & Equipment": 1.2, // Year-end purchases
  },
};
