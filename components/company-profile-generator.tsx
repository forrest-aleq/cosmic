"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { GenerationSettings } from "@/components/generation-settings"
import { GeneratedData } from "@/components/generated-data"

const formSchema = z.object({
  companyName: z.string().optional(),
  industry: z.string().optional(),
  foundingDate: z.date().optional(),
  companySize: z.string().optional(),
  businessModel: z.string().optional(),
  location: z.string().optional(),
  annualRevenue: z.number().optional(),
})

export function CompanyProfileGenerator() {
  const [activeTab, setActiveTab] = useState("generate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [uploadedProfile, setUploadedProfile] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      foundingDate: undefined,
      companySize: "",
      businessModel: "",
      location: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)

    // Simulate API call to the Python backend
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock generated data
      const mockData = generateMockData(values)
      setGeneratedData(mockData)
      setActiveTab("results")
    } catch (error) {
      console.error("Generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const profile = JSON.parse(e.target?.result as string)
        setUploadedProfile(profile)

        // Pre-fill the form with uploaded data
        form.reset({
          companyName: profile.company_name || "",
          industry: profile.industry || "",
          foundingDate: profile.founding_date ? new Date(profile.founding_date) : undefined,
          companySize: profile.company_size || "",
          businessModel: profile.business_model || "",
          location: profile.location || "",
          annualRevenue: profile.annual_revenue || undefined,
        })
      } catch (error) {
        console.error("Failed to parse JSON:", error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="generate">Generate</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="results" disabled={!generatedData}>
          Results
        </TabsTrigger>
      </TabsList>

      <TabsContent value="generate" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Profile</CardTitle>
              <CardDescription>Create a new company profile with random or specified parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Leave blank for random generation" {...field} />
                        </FormControl>
                        <FormDescription>Optional: Specify a company name or leave blank</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="random">Random</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Consulting">Consulting</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foundingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Founding Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : "Pick a date (or leave for random)"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="random">Random</SelectItem>
                            <SelectItem value="Startup (1-10)">Startup (1-10)</SelectItem>
                            <SelectItem value="Small (11-50)">Small (11-50)</SelectItem>
                            <SelectItem value="Medium (51-200)">Medium (51-200)</SelectItem>
                            <SelectItem value="Large (201-1000)">Large (201-1000)</SelectItem>
                            <SelectItem value="Enterprise (1000+)">Enterprise (1000+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Model</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="random">Random</SelectItem>
                            <SelectItem value="B2B">B2B</SelectItem>
                            <SelectItem value="B2C">B2C</SelectItem>
                            <SelectItem value="B2B2C">B2B2C</SelectItem>
                            <SelectItem value="D2C">D2C</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Company Profile"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Load Existing Profile</CardTitle>
              <CardDescription>Upload a previously generated company profile JSON file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="profile-upload">Profile JSON</Label>
                <Input id="profile-upload" type="file" accept=".json" onChange={handleFileUpload} />
              </div>

              {uploadedProfile && (
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Uploaded Profile:</h3>
                  <p className="text-sm">{uploadedProfile.company_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {uploadedProfile.industry} • {uploadedProfile.company_size}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                disabled={!uploadedProfile || isGenerating}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Statements from Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="settings">
        <GenerationSettings />
      </TabsContent>

      <TabsContent value="results">{generatedData && <GeneratedData data={generatedData} />}</TabsContent>
    </Tabs>
  )
}

// Replace the generateMockData function with this enhanced version that creates much more realistic data
function generateMockData(formValues: any) {
  const industries = ["Technology", "Retail", "Consulting", "Manufacturing", "Healthcare"]
  const businessModels = ["B2B", "B2C", "B2B2C", "D2C"]
  const companySizes = ["Startup (1-10)", "Small (11-50)", "Medium (51-200)", "Large (201-1000)", "Enterprise (1000+)"]

  // Use provided values or generate random ones
  const industry =
    formValues.industry && formValues.industry !== "random"
      ? formValues.industry
      : industries[Math.floor(Math.random() * industries.length)]

  const businessModel =
    formValues.businessModel && formValues.businessModel !== "random"
      ? formValues.businessModel
      : businessModels[Math.floor(Math.random() * businessModels.length)]

  const companySize =
    formValues.companySize && formValues.companySize !== "random"
      ? formValues.companySize
      : companySizes[Math.floor(Math.random() * companySizes.length)]

  // Generate company name if not provided
  let companyName = formValues.companyName
  if (!companyName) {
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
    ]
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
    ]
    companyName = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`
  }

  // Generate founding date if not provided
  const foundingDate =
    formValues.foundingDate ||
    new Date(2000 + Math.floor(Math.random() * 22), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)

  // Determine company size index for scaling data volume
  const sizeIndex = companySizes.indexOf(companySize)

  // Scale factors based on company size
  const transactionVolume = [50, 150, 400, 800, 1500][sizeIndex]
  const accountCount = [2, 3, 4, 5, 7][sizeIndex]
  const creditCardCount = [1, 2, 3, 4, 6][sizeIndex]
  const revenueBase = [500000, 2000000, 10000000, 50000000, 200000000][sizeIndex]

  // Generate realistic annual revenue with some randomness
  const annualRevenue = Math.floor(revenueBase * (0.8 + Math.random() * 0.4))

  // Industry-specific vendors and expense categories
  const industryVendors = {
    Technology: [
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
    Retail: [
      "Shopify",
      "Square",
      "UPS",
      "FedEx",
      "Facebook Ads",
      "Google Ads",
      "Instagram Ads",
      "Packaging Suppliers",
      "Shopping Malls Ltd",
      "Display Fixtures Co",
      "Visual Merchandising Inc",
      "Retail Space Leasing",
      "Inventory Management Systems",
      "POS Systems",
      "Security Systems",
    ],
    Consulting: [
      "American Airlines",
      "Delta",
      "Marriott",
      "Hilton",
      "Uber",
      "Lyft",
      "Coursera",
      "Udemy",
      "WeWork",
      "Staples",
      "Office Depot",
      "LinkedIn Premium",
      "Zoom",
      "Conference Registration",
      "Professional Association Dues",
      "Client Entertainment",
    ],
    Manufacturing: [
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
    Healthcare: [
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
  }

  const commonVendors = [
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
  ]

  // Combine industry-specific and common vendors
  const allVendors = [...(industryVendors[industry as keyof typeof industryVendors] || []), ...commonVendors]

  // Generate bank accounts with realistic names and balances
  const bankAccounts = []
  const bankNames = [
    "Chase",
    "Bank of America",
    "Wells Fargo",
    "Citibank",
    "Capital One",
    "TD Bank",
    "PNC Bank",
    "US Bank",
  ]

  // Primary operating account (always present)
  bankAccounts.push({
    account_name: "Primary Operating Account",
    account_type: "Checking",
    bank_name: bankNames[Math.floor(Math.random() * bankNames.length)],
    account_number: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
    routing_number: `${Math.floor(100000000 + Math.random() * 900000000)}`,
    starting_balance: Math.floor(annualRevenue * 0.08 * (0.7 + Math.random() * 0.6)),
  })

  // Savings account (almost always present)
  bankAccounts.push({
    account_name: "Business Savings",
    account_type: "Savings",
    bank_name: bankNames[Math.floor(Math.random() * bankNames.length)],
    account_number: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
    routing_number: `${Math.floor(100000000 + Math.random() * 900000000)}`,
    starting_balance: Math.floor(annualRevenue * 0.15 * (0.7 + Math.random() * 0.6)),
  })

  // Add additional accounts based on company size
  const accountTypes = ["Checking", "Money Market", "Savings"]
  const accountPurposes = ["Payroll", "Tax", "Reserve", "Investment", "Project", "Escrow", "International"]

  for (let i = 2; i < accountCount; i++) {
    const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)]
    const purpose = accountPurposes[Math.floor(Math.random() * accountPurposes.length)]

    bankAccounts.push({
      account_name: `${purpose} ${accountType}`,
      account_type: accountType,
      bank_name: bankNames[Math.floor(Math.random() * bankNames.length)],
      account_number: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
      routing_number: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      starting_balance: Math.floor(annualRevenue * 0.03 * (0.5 + Math.random() * 1.0)),
    })
  }

  // Generate credit cards with realistic details
  const creditCards = []
  const cardIssuers = ["American Express", "Chase", "Capital One", "Citi", "Bank of America", "Wells Fargo", "Brex"]
  const cardTypes = ["Business", "Corporate", "Purchasing", "Travel", "Rewards", "Cash Back"]

  // Primary business card (always present)
  creditCards.push({
    card_name: "Primary Business Card",
    issuer: cardIssuers[Math.floor(Math.random() * cardIssuers.length)],
    card_number: `XXXX-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
    credit_limit: Math.floor(annualRevenue * 0.02 * (0.7 + Math.random() * 0.6)),
    payment_due_day: Math.floor(1 + Math.random() * 28),
  })

  // Add additional cards based on company size
  for (let i = 1; i < creditCardCount; i++) {
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)]

    creditCards.push({
      card_name: `${cardType} Card`,
      issuer: cardIssuers[Math.floor(Math.random() * cardIssuers.length)],
      card_number: `XXXX-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      credit_limit: Math.floor(annualRevenue * 0.01 * (0.5 + Math.random() * 1.0)),
      payment_due_day: Math.floor(1 + Math.random() * 28),
    })
  }

  // Generate ultra-realistic transactions
  const generateTransactions = (count: number, accountType: string, accountName: string) => {
    const transactions = []

    // Transaction categories and descriptions based on account type
    const transactionCategories = {
      bank: {
        Deposit: [
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
          "Tax Refund",
          "Investment Return",
          "Loan Disbursement",
          "Grant Payment",
        ],
        Withdrawal: [
          "ATM Withdrawal",
          "Cash for Office",
          "Bank Withdrawal",
          "Cashier's Check",
          "Wire Transfer Fee",
          "Account Fee",
          "Overdraft Fee",
          "Service Charge",
          "Transfer to Savings",
          "Transfer to Investment",
          "Loan Payment",
        ],
        Payment: allVendors,
      },
      credit: {
        Purchase: allVendors,
        Payment: ["Payment - Thank You", "Online Payment", "Automatic Payment", "Bank Transfer Payment"],
        Fee: [
          "Late Fee",
          "Annual Fee",
          "Foreign Transaction Fee",
          "Cash Advance Fee",
          "Over Limit Fee",
          "Returned Payment Fee",
        ],
        Refund: allVendors.map((vendor) => `Refund: ${vendor}`),
      },
    }

    // Determine transaction type probabilities based on account type
    const typeProbs = {
      bank: {
        Checking: { Deposit: 0.35, Withdrawal: 0.15, Payment: 0.5 },
        Savings: { Deposit: 0.7, Withdrawal: 0.25, Payment: 0.05 },
        "Money Market": { Deposit: 0.6, Withdrawal: 0.3, Payment: 0.1 },
      },
      credit: {
        "Credit Card": { Purchase: 0.85, Payment: 0.1, Fee: 0.02, Refund: 0.03 },
      },
    }

    // Determine transaction amount ranges based on account type and company size
    const amountRanges = {
      bank: {
        Deposit: [
          [500, 5000],
          [1000, 20000],
          [5000, 50000],
          [10000, 200000],
          [50000, 500000],
        ],
        Withdrawal: [
          [100, 1000],
          [500, 5000],
          [1000, 10000],
          [5000, 50000],
          [10000, 100000],
        ],
        Payment: [
          [50, 2000],
          [100, 5000],
          [500, 20000],
          [1000, 50000],
          [5000, 100000],
        ],
      },
      credit: {
        Purchase: [
          [20, 1000],
          [50, 3000],
          [100, 8000],
          [200, 15000],
          [500, 30000],
        ],
        Payment: [
          [500, 5000],
          [1000, 10000],
          [5000, 30000],
          [10000, 50000],
          [20000, 100000],
        ],
        Fee: [
          [25, 100],
          [25, 150],
          [25, 200],
          [25, 250],
          [25, 300],
        ],
        Refund: [
          [20, 500],
          [50, 1000],
          [100, 2000],
          [200, 5000],
          [500, 10000],
        ],
      },
    }

    // Create realistic merchant codes and abbreviations
    const createMerchantCode = (vendor: string, date: Date) => {
      // Common locations for transactions
      const locations = ["NY", "CA", "TX", "IL", "FL", "WA", "MA", "CO", "GA", "OR", "NJ", "PA", "OH", "MI", "AZ"]
      const location = locations[Math.floor(Math.random() * locations.length)]

      // Create abbreviated vendor name
      let code = ""

      // Different formatting for different vendors
      if (vendor.includes("AWS") || vendor.includes("Amazon")) {
        code = `AMZN*${Math.random() < 0.5 ? "AWS" : "SERVICES"}`
      } else if (vendor.includes("Microsoft")) {
        code = `MSFT*${vendor.includes("Azure") ? "AZURE" : "M365"}`
      } else if (vendor.includes("Google")) {
        code = `GOOGLE*${vendor.includes("Cloud") ? "CLOUD" : "GSUITE"}`
      } else if (vendor.includes("Adobe")) {
        code = "ADOBE*CREATIVE CLD"
      } else if (vendor.includes("Slack")) {
        code = "SLACK.COM"
      } else if (vendor.includes("GitHub")) {
        code = "GITHUB.COM"
      } else if (vendor.includes("Heroku")) {
        code = "HEROKU.COM"
      } else if (vendor.includes("Shopify")) {
        code = "SHOPIFY*MONTHLY"
      } else if (vendor.includes("Square")) {
        code = "SQ*SQUARE"
      } else if (vendor.includes("UPS")) {
        code = "UPS*SHIPPING"
      } else if (vendor.includes("FedEx")) {
        code = "FEDEX*SHIPPING"
      } else if (vendor.includes("Zoom")) {
        code = "ZOOM.US"
      } else if (vendor.includes("LinkedIn")) {
        code = "LINKEDIN*PREMIUM"
      } else if (vendor.includes("Uber") || vendor.includes("Lyft")) {
        code = `${vendor.toUpperCase()}*RIDE ${date.getDate().toString().padStart(2, "0")}${(date.getMonth() + 1).toString().padStart(2, "0")}`
      } else if (vendor.includes("Marriott") || vendor.includes("Hilton")) {
        code = `${vendor.split(" ")[0].toUpperCase()} HOTELS`
      } else if (vendor.includes("Airlines")) {
        code = `${vendor.split(" ")[0].toUpperCase()} AIR`
      } else if (vendor.includes("Insurance")) {
        code = `${vendor.split(" ")[0].toUpperCase()} INS`
      } else if (vendor.includes("Electric") || vendor.includes("Utility")) {
        code = `${location} POWER & LIGHT`
      } else if (vendor.includes("Water")) {
        code = `${location} WATER UTIL`
      } else if (vendor.includes("Rent")) {
        code = `COMMERCIAL RENT ${location}`
      } else if (vendor.includes("Janitorial")) {
        code = "CLEAN SVCS INC"
      } else if (vendor.includes("Coffee")) {
        code = "OFFICE COFFEE SVC"
      } else if (vendor.includes("Snacks")) {
        code = "SNACK DELIVERY SVC"
      } else if (vendor.includes("Legal")) {
        code = "LEGAL COUNSEL LLC"
      } else if (vendor.includes("Accounting")) {
        code = "ACCT SERVICES INC"
      } else {
        // For other vendors, create an abbreviated version
        const words = vendor.split(" ")
        if (words.length === 1) {
          // Single word, take first 5 chars or whole word if shorter
          code = vendor.substring(0, 5).toUpperCase()
        } else {
          // Multiple words, take first letter or first two letters of each word
          code = words.map((word) => word.substring(0, Math.random() < 0.5 ? 1 : 2).toUpperCase()).join("")
        }
      }

      // Add location for most transactions
      if (Math.random() < 0.8) {
        code += ` ${location}`
      }

      // Add reference number for some transactions
      if (Math.random() < 0.4) {
        const refNum = Math.floor(10000 + Math.random() * 90000)
        code += ` REF#${refNum}`
      }

      // Add date code for some transactions
      if (Math.random() < 0.3) {
        code += ` ${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`
      }

      return code
    }

    // Generate transaction dates spanning 2 years with higher density in recent months
    const today = new Date()

    const dates = []
    // Generate more dates in recent months (recency bias)
    for (let i = 0; i < count; i++) {
      // Bias toward more recent dates
      const daysAgo = Math.floor(Math.pow(Math.random(), 1.5) * 730) // Exponential distribution
      const date = new Date(today)
      date.setDate(today.getDate() - daysAgo)
      dates.push(date)
    }

    // Sort dates chronologically
    dates.sort((a, b) => a.getTime() - b.getTime())

    // Generate transactions for each date
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]

      // Determine transaction type based on probabilities
      const typeProb = Math.random()
      let transactionType
      let cumulativeProb = 0

      // Get the appropriate probability map based on account type
      const probMap =
        accountType === "bank"
          ? typeProbs.bank[
              accountName.includes("Savings")
                ? "Savings"
                : accountName.includes("Money Market")
                  ? "Money Market"
                  : "Checking"
            ]
          : typeProbs.credit["Credit Card"]

      for (const [type, prob] of Object.entries(probMap)) {
        cumulativeProb += prob
        if (typeProb <= cumulativeProb) {
          transactionType = type
          break
        }
      }

      // Determine transaction amount based on type and company size
      let amount

      // Define realistic price ranges for specific vendors and services
      const vendorPriceRanges = {
        // SaaS and Cloud Services - scaled by company size
        AWS: [
          [50, 500],
          [500, 3000],
          [2000, 10000],
          [8000, 30000],
          [20000, 100000],
        ],
        "Microsoft Azure": [
          [50, 500],
          [500, 3000],
          [2000, 10000],
          [8000, 30000],
          [20000, 100000],
        ],
        "Google Cloud": [
          [50, 500],
          [500, 3000],
          [2000, 10000],
          [8000, 30000],
          [20000, 100000],
        ],
        Heroku: [
          [25, 100],
          [100, 500],
          [500, 2000],
          [1000, 5000],
          [3000, 15000],
        ],
        "MongoDB Atlas": [
          [15, 100],
          [100, 500],
          [500, 2000],
          [1000, 5000],
          [3000, 15000],
        ],
        "Digital Ocean": [
          [10, 100],
          [100, 500],
          [300, 1500],
          [1000, 5000],
          [3000, 15000],
        ],

        // Communication and Productivity Tools - more modest scaling
        Slack: [
          [8, 80],
          [80, 400],
          [400, 2000],
          [2000, 8000],
          [8000, 25000],
        ],
        Zoom: [
          [15, 50],
          [50, 300],
          [300, 1500],
          [1500, 6000],
          [6000, 20000],
        ],
        "Microsoft 365": [
          [12, 100],
          [100, 500],
          [500, 2500],
          [2500, 10000],
          [10000, 30000],
        ],
        "Google Workspace": [
          [6, 60],
          [60, 300],
          [300, 1500],
          [1500, 6000],
          [6000, 20000],
        ],
        "Adobe Creative Cloud": [
          [30, 100],
          [100, 500],
          [500, 2500],
          [2500, 10000],
          [5000, 20000],
        ],

        // Marketing and Analytics
        Mailchimp: [
          [15, 50],
          [50, 200],
          [200, 1000],
          [1000, 3000],
          [3000, 10000],
        ],
        "Facebook Ads": [
          [50, 300],
          [300, 1500],
          [1500, 7500],
          [7500, 30000],
          [30000, 100000],
        ],
        "Google Ads": [
          [50, 300],
          [300, 1500],
          [1500, 7500],
          [7500, 30000],
          [30000, 100000],
        ],
        "Instagram Ads": [
          [50, 300],
          [300, 1500],
          [1500, 7500],
          [7500, 30000],
          [30000, 100000],
        ],

        // Development Tools
        GitHub: [
          [7, 50],
          [50, 250],
          [250, 1000],
          [1000, 5000],
          [5000, 15000],
        ],
        JetBrains: [
          [15, 50],
          [50, 250],
          [250, 1000],
          [1000, 4000],
          [4000, 12000],
        ],
        Atlassian: [
          [10, 100],
          [100, 500],
          [500, 2500],
          [2500, 10000],
          [10000, 30000],
        ],

        // Utilities and Office
        "Electric Company": [
          [100, 300],
          [300, 1000],
          [1000, 3000],
          [3000, 10000],
          [10000, 30000],
        ],
        "Water Utility": [
          [50, 150],
          [150, 500],
          [500, 1500],
          [1500, 5000],
          [5000, 15000],
        ],
        "Commercial Rent": [
          [1000, 3000],
          [3000, 10000],
          [10000, 30000],
          [30000, 100000],
          [100000, 300000],
        ],
        "Janitorial Services": [
          [100, 300],
          [300, 1000],
          [1000, 3000],
          [3000, 10000],
          [10000, 30000],
        ],
        "Office Snacks": [
          [20, 100],
          [100, 300],
          [300, 1000],
          [1000, 3000],
          [3000, 10000],
        ],
        "Coffee Service": [
          [20, 80],
          [80, 250],
          [250, 800],
          [800, 2500],
          [2500, 8000],
        ],

        // Shipping and Logistics
        UPS: [
          [20, 100],
          [100, 500],
          [500, 2000],
          [2000, 8000],
          [8000, 25000],
        ],
        FedEx: [
          [20, 100],
          [100, 500],
          [500, 2000],
          [2000, 8000],
          [8000, 25000],
        ],
        USPS: [
          [10, 50],
          [50, 250],
          [250, 1000],
          [1000, 4000],
          [4000, 12000],
        ],

        // Travel and Entertainment
        "American Airlines": [
          [300, 800],
          [800, 2500],
          [2500, 8000],
          [8000, 25000],
          [25000, 80000],
        ],
        Delta: [
          [300, 800],
          [800, 2500],
          [2500, 8000],
          [8000, 25000],
          [25000, 80000],
        ],
        Marriott: [
          [150, 500],
          [500, 1500],
          [1500, 5000],
          [5000, 15000],
          [15000, 50000],
        ],
        Hilton: [
          [150, 500],
          [500, 1500],
          [1500, 5000],
          [5000, 15000],
          [15000, 50000],
        ],
        Uber: [
          [10, 50],
          [50, 250],
          [250, 1000],
          [1000, 4000],
          [4000, 12000],
        ],
        Lyft: [
          [10, 50],
          [50, 250],
          [250, 1000],
          [1000, 4000],
          [4000, 12000],
        ],

        // Professional Services
        "Legal Services": [
          [500, 2000],
          [2000, 8000],
          [8000, 25000],
          [25000, 80000],
          [80000, 250000],
        ],
        "Accounting Services": [
          [300, 1000],
          [1000, 4000],
          [4000, 12000],
          [12000, 40000],
          [40000, 120000],
        ],
        "IT Support": [
          [200, 800],
          [800, 3000],
          [3000, 10000],
          [10000, 30000],
          [30000, 100000],
        ],
        "Cybersecurity Services": [
          [300, 1000],
          [1000, 4000],
          [4000, 15000],
          [15000, 50000],
          [50000, 150000],
        ],

        // Industry-specific
        "Medical Suppliers Co": [
          [200, 1000],
          [1000, 5000],
          [5000, 20000],
          [20000, 80000],
          [80000, 300000],
        ],
        "Steel Suppliers Inc": [
          [500, 2000],
          [2000, 10000],
          [10000, 40000],
          [40000, 150000],
          [150000, 500000],
        ],
        "Machinery Parts Co": [
          [300, 1500],
          [1500, 7000],
          [7000, 30000],
          [30000, 120000],
          [120000, 400000],
        ],
        "Factory Equipment Ltd": [
          [1000, 5000],
          [5000, 20000],
          [20000, 80000],
          [80000, 300000],
          [300000, 1000000],
        ],
        "Retail Space Leasing": [
          [1000, 5000],
          [5000, 20000],
          [20000, 80000],
          [80000, 300000],
          [300000, 1000000],
        ],
      }

      // Default ranges for transaction types if no specific vendor match
      const defaultRanges = {
        bank: {
          Deposit: [
            [500, 5000],
            [1000, 20000],
            [5000, 50000],
            [10000, 200000],
            [50000, 500000],
          ],
          Withdrawal: [
            [100, 1000],
            [500, 5000],
            [1000, 10000],
            [5000, 50000],
            [10000, 100000],
          ],
          Payment: [
            [50, 2000],
            [100, 5000],
            [500, 20000],
            [1000, 50000],
            [5000, 100000],
          ],
        },
        credit: {
          Purchase: [
            [20, 1000],
            [50, 3000],
            [100, 8000],
            [200, 15000],
            [500, 30000],
          ],
          Payment: [
            [500, 5000],
            [1000, 10000],
            [5000, 30000],
            [10000, 50000],
            [20000, 100000],
          ],
          Fee: [
            [25, 100],
            [25, 150],
            [25, 200],
            [25, 250],
            [25, 300],
          ],
          Refund: [
            [20, 500],
            [50, 1000],
            [100, 2000],
            [200, 5000],
            [500, 10000],
          ],
        },
      }

      // Find the base description to determine the vendor
      const categoryList =
        transactionCategories[accountType as keyof typeof transactionCategories][transactionType as any]
      const baseDescription = categoryList ? categoryList[Math.floor(Math.random() * categoryList.length)] : ""
      const baseVendor = baseDescription.replace("Refund: ", "")

      // Check if we have specific price ranges for this vendor
      let priceRange
      for (const [vendor, ranges] of Object.entries(vendorPriceRanges)) {
        if (baseVendor.includes(vendor)) {
          priceRange = ranges[sizeIndex]
          break
        }
      }

      // If no specific vendor match, use default ranges
      if (!priceRange) {
        priceRange =
          accountType === "bank"
            ? defaultRanges.bank[transactionType as keyof typeof defaultRanges.bank][sizeIndex]
            : defaultRanges.credit[transactionType as keyof typeof defaultRanges.credit][sizeIndex]
      }

      // Apply industry-specific adjustments
      if (industry === "Technology") {
        // Tech companies spend more on software and cloud services
        if (
          baseVendor.includes("AWS") ||
          baseVendor.includes("Azure") ||
          baseVendor.includes("Cloud") ||
          baseVendor.includes("GitHub") ||
          baseVendor.includes("JetBrains")
        ) {
          priceRange = [priceRange[0] * 1.5, priceRange[1] * 1.5]
        }
      } else if (industry === "Manufacturing") {
        // Manufacturing companies spend less on software, more on materials and equipment
        if (
          baseVendor.includes("AWS") ||
          baseVendor.includes("Azure") ||
          baseVendor.includes("Cloud") ||
          baseVendor.includes("Slack") ||
          baseVendor.includes("Zoom")
        ) {
          priceRange = [priceRange[0] * 0.6, priceRange[1] * 0.6]
        }
        if (baseVendor.includes("Steel") || baseVendor.includes("Machinery") || baseVendor.includes("Equipment")) {
          priceRange = [priceRange[0] * 1.5, priceRange[1] * 1.5]
        }
      } else if (industry === "Healthcare") {
        // Healthcare companies spend more on compliance and specialized software
        if (baseVendor.includes("Compliance") || baseVendor.includes("Medical") || baseVendor.includes("Healthcare")) {
          priceRange = [priceRange[0] * 1.3, priceRange[1] * 1.3]
        }
      }

      // Make amounts more realistic by clustering around common values
      if (Math.random() < 0.3) {
        // Round numbers like 500, 1000, 2500
        const roundBases = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
        // Choose an appropriate base for the price range
        const filteredBases = roundBases.filter((base) => base <= priceRange[1] / 2)
        const base = filteredBases[Math.floor(Math.random() * filteredBases.length)] || 5
        const multiplier = Math.max(
          1,
          Math.floor(priceRange[0] / base) +
            Math.floor(Math.random() * (Math.floor(priceRange[1] / base) - Math.floor(priceRange[0] / base) + 1)),
        )
        amount = base * multiplier
      } else if (Math.random() < 0.4) {
        // Prices ending in .99 or .95
        amount = priceRange[0] + Math.random() * (priceRange[1] - priceRange[0])
        amount = Math.floor(amount) + (Math.random() < 0.7 ? 0.99 : 0.95)
      } else if (
        Math.random() < 0.3 &&
        (baseVendor.includes("Subscription") ||
          baseVendor.includes("Slack") ||
          baseVendor.includes("Zoom") ||
          baseVendor.includes("Microsoft") ||
          baseVendor.includes("Google") ||
          baseVendor.includes("Adobe"))
      ) {
        // Subscription-like amounts (recurring fixed amounts)
        const subscriptionBases = [4.99, 9.99, 14.99, 19.99, 29.99, 49.99, 99.99, 199.99, 299.99]
        // Filter to appropriate subscription tiers for the price range
        const filteredSubs = subscriptionBases.filter((sub) => sub >= priceRange[0] * 0.5 && sub <= priceRange[1] * 0.8)
        amount =
          filteredSubs.length > 0
            ? filteredSubs[Math.floor(Math.random() * filteredSubs.length)]
            : subscriptionBases[Math.floor(Math.random() * subscriptionBases.length)]

        // Scale for team size
        const teamSizes = [1, 5, 20, 100, 500]
        const teamSize = teamSizes[sizeIndex]
        amount *= teamSize
      } else {
        // Random amount within range, but with cents
        amount = priceRange[0] + Math.random() * (priceRange[1] - priceRange[0])
        // Round to cents
        amount = Math.round(amount * 100) / 100
      }

      // Add some large outlier transactions occasionally, but keep them realistic
      if (Math.random() < 0.03) {
        // Cap the multiplier to avoid absurd amounts
        const maxMultiplier = Math.min(3, priceRange[1] / amount)
        amount *= 1 + Math.random() * (maxMultiplier - 1)
      }

      // Make payments and withdrawals negative
      if (
        (accountType === "bank" && (transactionType === "Payment" || transactionType === "Withdrawal")) ||
        (accountType === "credit" && (transactionType === "Purchase" || transactionType === "Fee"))
      ) {
        amount = -amount
      }

      // Generate description based on transaction type
      let description
      const categoryListForDescription =
        transactionCategories[accountType as keyof typeof transactionCategories][transactionType as any]

      if (categoryListForDescription) {
        const baseDescription =
          categoryListForDescription[Math.floor(Math.random() * categoryListForDescription.length)]

        // Format description based on transaction type
        if (accountType === "bank") {
          if (transactionType === "Deposit") {
            if (baseDescription.includes("Invoice")) {
              // Invoice payments
              const invoiceNum = Math.floor(10000 + Math.random() * 90000)
              const clientInitials = Array(2)
                .fill(0)
                .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
                .join("")
              description = `${baseDescription} #INV-${invoiceNum} ${clientInitials}`
            } else if (baseDescription.includes("ACH")) {
              // ACH deposits
              const companyInitials = Array(3)
                .fill(0)
                .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
                .join("")
              description = `${baseDescription} ${companyInitials} ${Math.floor(1000000 + Math.random() * 9000000)}`
            } else if (baseDescription.includes("Wire")) {
              // Wire transfers
              description = `${baseDescription} REF# ${Math.floor(100000 + Math.random() * 900000)}`
            } else if (
              baseDescription.includes("Square") ||
              baseDescription.includes("Stripe") ||
              baseDescription.includes("PayPal")
            ) {
              // Payment processor transfers
              const processorId = Math.floor(10000000 + Math.random() * 90000000)
              description = `${baseDescription.split(" ")[0].toUpperCase()} TRANSFER ID${processorId}`
            } else {
              description = baseDescription
            }
          } else if (transactionType === "Withdrawal") {
            if (baseDescription.includes("ATM")) {
              // ATM withdrawals
              const locations = [
                "MAIN ST",
                "BROADWAY",
                "1ST AVE",
                "MARKET ST",
                "DOWNTOWN",
                "UPTOWN",
                "MIDTOWN",
                "FINANCIAL DIST",
              ]
              const location = locations[Math.floor(Math.random() * locations.length)]
              description = `${baseDescription} ${location} #${Math.floor(1000 + Math.random() * 9000)}`
            } else if (baseDescription.includes("Wire")) {
              // Wire transfer fees
              description = `${baseDescription} ID${Math.floor(1000000 + Math.random() * 9000000)}`
            } else {
              description = baseDescription
            }
          } else if (transactionType === "Payment") {
            // Vendor payments
            description = createMerchantCode(baseDescription, date)
          }
        } else if (accountType === "credit") {
          if (transactionType === "Purchase") {
            // Credit card purchases
            description = createMerchantCode(baseDescription, date)
          } else if (transactionType === "Payment") {
            // Credit card payments
            const paymentMethods = ["WEB", "PHONE", "AUTO", "BRANCH"]
            const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
            description = `${baseDescription} ${method} ${date.getMonth() + 1}/${date.getDate()}`
          } else if (transactionType === "Fee") {
            // Credit card fees
            description = baseDescription.toUpperCase()
          } else if (transactionType === "Refund") {
            // Credit card refunds
            const originalVendor = baseDescription.replace("Refund: ", "")
            description = `REFUND: ${createMerchantCode(originalVendor, date)}`
          }
        }
      } else {
        description = `${transactionType} Transaction`
      }

      transactions.push({
        date: date.toISOString().split("T")[0],
        description: description,
        amount: amount,
        type: transactionType,
        balance: 0, // Will be calculated later
      })
    }

    // Calculate running balance
    let balance =
      accountType === "bank"
        ? bankAccounts.find((acc) => acc.account_name === accountName)?.starting_balance || 50000
        : 0

    transactions.forEach((t) => {
      balance += t.amount
      t.balance = Math.round(balance * 100) / 100
    })

    return transactions
  }

  // Generate bank and credit card statements with appropriate transaction volumes
  const bankStatements = {}
  bankAccounts.forEach((account) => {
    // Scale transaction count based on account type and company size
    let transactionMultiplier = 1
    if (account.account_name === "Primary Operating Account") transactionMultiplier = 2
    if (account.account_type === "Savings") transactionMultiplier = 0.3
    if (account.account_type === "Money Market") transactionMultiplier = 0.5

    const accountTransactionCount = Math.floor(transactionVolume * transactionMultiplier)
    bankStatements[account.account_name] = generateTransactions(accountTransactionCount, "bank", account.account_name)
  })

  const creditStatements = {}
  creditCards.forEach((card) => {
    // Scale transaction count based on card type and company size
    let transactionMultiplier = 1
    if (card.card_name === "Primary Business Card") transactionMultiplier = 1.5
    if (card.card_name.includes("Travel")) transactionMultiplier = 0.7
    if (card.card_name.includes("Purchasing")) transactionMultiplier = 1.2

    const cardTransactionCount = Math.floor(transactionVolume * 0.8 * transactionMultiplier)
    creditStatements[card.card_name] = generateTransactions(cardTransactionCount, "credit", card.card_name)
  })

  // Generate products/services based on industry
  const industryServices = {
    Technology: [
      "Software Development",
      "Cloud Computing",
      "Data Analytics",
      "Cybersecurity",
      "IT Consulting",
      "Mobile Apps",
      "AI Solutions",
    ],
    Retail: [
      "Clothing",
      "Electronics",
      "Home Goods",
      "Food & Beverage",
      "Beauty Products",
      "Specialty Items",
      "Online Sales",
    ],
    Consulting: [
      "Business Strategy",
      "Financial Advisory",
      "Marketing Consulting",
      "HR Consulting",
      "IT Advisory",
      "Management Consulting",
    ],
    Manufacturing: [
      "Consumer Goods",
      "Industrial Equipment",
      "Electronics Assembly",
      "Food Processing",
      "Automotive Parts",
      "Construction Materials",
    ],
    Healthcare: [
      "Medical Services",
      "Healthcare Software",
      "Medical Equipment",
      "Patient Care",
      "Telehealth",
      "Diagnostics",
    ],
  }

  // Select 2-4 services based on industry
  const services = industryServices[industry as keyof typeof industryServices] || []
  const selectedServices = []
  const serviceCount = 2 + Math.floor(Math.random() * 3)

  for (let i = 0; i < serviceCount; i++) {
    if (services.length > 0) {
      const index = Math.floor(Math.random() * services.length)
      selectedServices.push(services[index])
      services.splice(index, 1)
    }
  }

  return {
    profile: {
      company_name: companyName,
      industry: industry,
      founding_date: foundingDate.toISOString().split("T")[0],
      company_size: companySize,
      business_model: businessModel,
      products_services: selectedServices,
      location: "San Francisco, US",
      annual_revenue: annualRevenue,
      account_structures: {
        bank_accounts: bankAccounts,
        credit_cards: creditCards,
      },
    },
    bank_statements: bankStatements,
    credit_statements: creditStatements,
  }
}

// Label component for file upload
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}

