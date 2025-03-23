/**
 * Company profile generator module
 * Handles the generation of realistic company profiles with consistent
 * financial metrics based on industry, size, and business model
 */

import { CompanyProfile } from "@/types/plaid-types";

/**
 * Company size categories and their typical employee ranges
 */
export const COMPANY_SIZES = {
  "Startup (1-10)": { min: 1, max: 10, index: 0 },
  "Small (11-50)": { min: 11, max: 50, index: 1 },
  "Medium (51-200)": { min: 51, max: 200, index: 2 },
  "Large (201-1000)": { min: 201, max: 1000, index: 3 },
  "Enterprise (1000+)": { min: 1001, max: 50000, index: 4 },
};

/**
 * Industry options for company profiles
 */
export const INDUSTRIES = [
  "Technology",
  "Retail",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Consulting",
  "Real Estate",
  "Education",
  "Hospitality",
  "Media & Entertainment",
];

/**
 * Business model options for company profiles
 */
export const BUSINESS_MODELS = ["B2B", "B2C", "B2B2C", "D2C", "Marketplace", "SaaS", "Subscription"];

/**
 * Generates a company name if none is provided
 * @returns A randomly generated company name
 */
export function generateCompanyName(): string {
  const prefixes = [
    "Tech",
    "Global",
    "Advanced",
    "Premier",
    "Elite",
    "Smart",
    "Innovative",
    "Quantum",
    "Stellar",
    "Cosmic",
    "Apex",
    "Nova",
    "Omni",
    "Peak",
    "Prime",
  ];
  
  const suffixes = [
    "Solutions",
    "Systems",
    "Technologies",
    "Group",
    "Partners",
    "Enterprises",
    "Industries",
    "Networks",
    "Dynamics",
    "Ventures",
    "Labs",
    "Hub",
    "AI",
    "Tech",
    "Connect",
  ];
  
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

/**
 * Generates a random date within a specific range
 * @param startYear Earliest possible founding year
 * @param endYear Latest possible founding year
 * @returns A random date within the specified range
 */
export function generateRandomDate(startYear = 1980, endYear = 2023): Date {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Avoiding edge cases with month lengths
  
  return new Date(year, month, day);
}

/**
 * Calculate financial metrics based on company profile
 * @param profile The company profile data
 * @returns The company profile with added financial metrics
 */
export function calculateFinancialMetrics(profile: CompanyProfile): CompanyProfile {
  // Get size index for scaling financial data appropriately
  const sizeIndex = COMPANY_SIZES[profile.company_size as keyof typeof COMPANY_SIZES]?.index || 0;
  
  // Base revenue multipliers by industry (Technology tends to have higher revenue per employee than Retail, etc.)
  const industryMultipliers: Record<string, number> = {
    "Technology": 1.5,
    "Financial Services": 1.8,
    "Healthcare": 1.2,
    "Retail": 0.7,
    "Manufacturing": 1.0,
    "Consulting": 1.3,
    "Real Estate": 1.4,
    "Education": 0.6,
    "Hospitality": 0.5,
    "Media & Entertainment": 1.1,
  };
  
  // Base revenue amounts by company size
  const baseRevenues = [500000, 2000000, 10000000, 50000000, 200000000];
  const baseRevenue = baseRevenues[sizeIndex];
  
  // Apply industry multiplier
  const industryMultiplier = industryMultipliers[profile.industry] || 1.0;
  
  // Apply some randomness for variability
  const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
  
  // Calculate annual revenue
  const annualRevenue = Math.round(baseRevenue * industryMultiplier * randomFactor);
  
  return {
    ...profile,
    annual_revenue: annualRevenue,
  };
}

/**
 * Generate a complete company profile with realistic values
 * @param partialProfile Optional partial profile to use as a base
 * @returns A complete company profile with all required fields
 */
export function generateCompanyProfile(partialProfile?: Partial<CompanyProfile>): CompanyProfile {
  // Use provided values or generate random ones
  const industry = partialProfile?.industry || INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
  const businessModel = partialProfile?.business_model || BUSINESS_MODELS[Math.floor(Math.random() * BUSINESS_MODELS.length)];
  const companySize = partialProfile?.company_size || Object.keys(COMPANY_SIZES)[Math.floor(Math.random() * Object.keys(COMPANY_SIZES).length)];
  const companyName = partialProfile?.company_name || generateCompanyName();
  const foundingDate = partialProfile?.founding_date || generateRandomDate();
  
  // Create initial profile
  const profile: CompanyProfile = {
    company_name: companyName,
    industry: industry,
    business_model: businessModel,
    company_size: companySize,
    founding_date: foundingDate,
    location: partialProfile?.location || "New York, NY",
  };
  
  // Add calculated financial metrics
  return calculateFinancialMetrics(profile);
}
