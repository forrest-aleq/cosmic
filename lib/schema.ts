/**
 * Zod schemas for form validation and data integrity
 * These schemas define the validation rules for our forms and data structures
 */

import { z } from "zod";
import { INDUSTRIES, BUSINESS_MODELS, COMPANY_SIZES } from "./generators";

/**
 * Validators for company profile data
 */
export const companyProfileSchema = z.object({
  company_name: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters" })
    .max(100, { message: "Company name must be less than 100 characters" }),
  
  industry: z
    .enum(INDUSTRIES as [string, ...string[]], {
      message: "Please select a valid industry",
    }),
  
  business_model: z
    .enum(BUSINESS_MODELS as [string, ...string[]], {
      message: "Please select a valid business model",
    }),
  
  company_size: z
    .enum(Object.keys(COMPANY_SIZES) as [string, ...string[]], {
      message: "Please select a valid company size",
    }),
  
  founding_date: z
    .date({
      message: "Please enter a valid founding date",
    })
    .refine((date) => date <= new Date(), {
      message: "Founding date cannot be in the future",
    }),
  
  location: z
    .string()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(100, { message: "Location must be less than 100 characters" })
    .optional(),
  
  annual_revenue: z
    .number()
    .positive({ message: "Annual revenue must be positive" })
    .optional(),
});

/**
 * Validators for data generation options
 */
export const dataGenerationOptionsSchema = z.object({
  num_transactions: z
    .number()
    .int({ message: "Number of transactions must be an integer" })
    .min(10, { message: "At least 10 transactions are required for realistic data" })
    .max(5000, { message: "Maximum of 5000 transactions allowed" }),
  
  start_date: z
    .date({ message: "Please enter a valid start date" })
    .refine((date) => date <= new Date(), {
      message: "Start date cannot be in the future",
    }),
  
  end_date: z
    .date({ message: "Please enter a valid end date" })
    .refine((date) => date <= new Date(), {
      message: "End date cannot be in the future",
    }),
  
  include_deposits: z
    .boolean()
    .default(true),
  
  include_payments: z
    .boolean()
    .default(true),
  
  include_investments: z
    .boolean()
    .default(false),
  
  include_loans: z
    .boolean()
    .default(false),
});

/**
 * Combined schema for the full form
 */
export const fullFormSchema = z.object({
  company: companyProfileSchema,
  options: dataGenerationOptionsSchema,
}).refine((data) => {
  return data.options.start_date < data.options.end_date;
}, {
  message: "Start date must be before end date",
  path: ["options.start_date"],
});

/**
 * TypeScript type extraction from schemas
 */
export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;
export type DataGenerationOptions = z.infer<typeof dataGenerationOptionsSchema>;
export type FullFormData = z.infer<typeof fullFormSchema>;
