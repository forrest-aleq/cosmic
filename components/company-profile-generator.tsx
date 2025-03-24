"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon, Loader2, DownloadIcon, CopyIcon, CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { GenerationSettings } from "@/components/generation-settings"
import { GeneratedData } from "@/components/generated-data"

// Import our schema, types, and generators
import { fullFormSchema, type FullFormData, type CompanyProfileFormData, type DataGenerationOptions } from "@/lib/schema"
import { 
  INDUSTRIES, 
  BUSINESS_MODELS, 
  COMPANY_SIZES,
  CompanyProfile, 
  PlaidTransactionsResponse 
} from "@/lib/generators"
import { generateFinancialData, formatDataForDownload } from "@/lib/generators/main-generator"
import { validateFinancialData, calculateDataStatistics, formatTransactionsAsCsv } from "@/lib/validation"

export function CompanyProfileGenerator() {
  const [activeTab, setActiveTab] = useState("generate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<PlaidTransactionsResponse | null>(null)
  const [uploadedProfile, setUploadedProfile] = useState<CompanyProfile | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [validationResults, setValidationResults] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null)
  const [dataStats, setDataStats] = useState<{
    totalAccounts: number;
    totalTransactions: number;
    accountTypes: Record<string, number>;
    transactionVolume: number;
    averageTransactionAmount: number;
    transactionsByMonth: Record<string, number>;
  } | null>(null)
  const [copied, setCopied] = useState(false)

  // Create the form using our validated schema
  const form = useForm<FullFormData>({
    resolver: zodResolver(fullFormSchema),
    defaultValues: {
      company: {
        company_name: "",
        industry: INDUSTRIES[0],
        founding_date: new Date(2010, 0, 1),
        company_size: Object.keys(COMPANY_SIZES)[2], // Default to Medium
        business_model: BUSINESS_MODELS[0],
        location: "New York, NY",
      },
      options: {
        num_transactions: 100,
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        end_date: new Date(),
        include_deposits: true,
        include_payments: true,
        include_investments: false,
        include_loans: false,
      }
    },
  })

  async function onSubmit(values: FullFormData) {
    setIsGenerating(true)
    setErrorMessage(null)
    setValidationResults(null)
    setDataStats(null)

    try {
      // Generate random company name if blank
      if (!values.company.company_name || values.company.company_name.trim() === '') {
        const randomNames = [
          "Horizon Tech",
          "Apex Solutions",
          "Nimbus Systems",
          "Quantum Dynamics",
          "Stellar Innovations",
          "Vertex Holdings",
          "Cirrus Digital",
          "Momentum Labs",
          "Fusion Enterprises",
          "Prism Technologies",
        ];
        values.company.company_name = randomNames[Math.floor(Math.random() * randomNames.length)];
      }
      
      // Ensure location is set if blank
      if (!values.company.location || values.company.location.trim() === '') {
        const randomLocations = [
          "New York, NY",
          "San Francisco, CA",
          "Chicago, IL",
          "Austin, TX",
          "Boston, MA",
          "Seattle, WA",
          "Los Angeles, CA",
          "Denver, CO",
          "Atlanta, GA",
          "Miami, FL",
        ];
        values.company.location = randomLocations[Math.floor(Math.random() * randomLocations.length)];
      }

      // Simulate API call delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate data using our new generator
      const data = generateFinancialData(values.company, values.options)
      
      // Validate the generated data
      const validation = validateFinancialData(data)
      setValidationResults(validation)
      
      // Calculate statistics
      const stats = calculateDataStatistics(data)
      setDataStats(stats)
      
      // Set the generated data and switch to results tab
      setGeneratedData(data)
      setActiveTab("results")
    } catch (error) {
      console.error("Generation failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
      // Keep user on the current tab to show error
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
        const json = JSON.parse(e.target?.result as string)
        
        // Handle both company profile uploads and full data uploads
        const profile = json.accounts ? {
          company_name: json.company_name || "Imported Company",
          industry: json.industry || INDUSTRIES[0],
          business_model: json.business_model || BUSINESS_MODELS[0],
          company_size: json.company_size || Object.keys(COMPANY_SIZES)[2],
          founding_date: json.founding_date ? new Date(json.founding_date) : new Date(2010, 0, 1),
          location: json.location || "New York, NY",
          annual_revenue: json.annual_revenue,
        } : json;
        
        setUploadedProfile(profile);

        // Pre-fill the form with uploaded data
        form.reset({
          company: {
            company_name: profile.company_name || "",
            industry: profile.industry || INDUSTRIES[0],
            founding_date: profile.founding_date ? new Date(profile.founding_date) : new Date(2010, 0, 1),
            company_size: profile.company_size || Object.keys(COMPANY_SIZES)[2],
            business_model: profile.business_model || BUSINESS_MODELS[0],
            location: profile.location || "New York, NY",
            annual_revenue: profile.annual_revenue,
          },
          options: form.getValues().options, // Keep existing options
        });
      } catch (error) {
        console.error("Failed to parse JSON:", error)
      }
    }
    reader.readAsText(file)
  }

  function handleDownload() {
    if (!generatedData) return;
    
    const dataStr = formatDataForDownload(generatedData);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedData.accounts[0]?.name || 'company'}_financial_data.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  function handleCsvDownload() {
    if (!generatedData) return;
    
    const csvStr = formatTransactionsAsCsv(generatedData);
    const csvBlob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedData.accounts[0]?.name || 'company'}_transactions.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // Function to format real data into sample format for display
  function formatSampleData() {
    if (!generatedData) return "{}";
    
    // Create an exact Plaid-formatted sample based on the actual generated data
    const sample = {
      accounts: generatedData.accounts.slice(0, 2),
      added: generatedData.added.slice(0, 3),
      modified: generatedData.modified.slice(0, 2),
      removed: generatedData.removed.slice(0, 1),
      next_cursor: generatedData.next_cursor || "tVUUL15lYQN5rBnfDIc1I8xudpGdIlw9nsgeXWvhOfkECvUeR663i3Dt1uf/94S8ASkitgLcIiOSqNwzzp+bh89kirazha5vuZHBb2ZA5NtCDkkV",
      has_more: false,
      request_id: generatedData.request_id || "Wvhy9PZHQLV8njG",
      item_id: generatedData.item_id || `item_${Math.random().toString(36).substring(2, 10)}`,
      transactions_update_status: "HISTORICAL_UPDATE_COMPLETE"
    };
    
    return JSON.stringify(sample, null, 2);
  }

  function handleCopyToClipboard() {
    if (!generatedData) return;
    navigator.clipboard.writeText(formatSampleData())
      .then(() => {
        // Show confirmation
        setCopied(true);
        
        // Reset after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy JSON: ", err);
      });
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
                    name="company.company_name"
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
                    name="company.industry"
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
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company.founding_date"
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
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
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
                    name="company.company_size"
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
                            {Object.keys(COMPANY_SIZES).map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company.business_model"
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
                            {BUSINESS_MODELS.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company.location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium">Data Generation Options</h3>

                    <FormField
                      control={form.control}
                      name="options.num_transactions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Transactions</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={10} 
                              max={5000}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 100)}
                            />
                          </FormControl>
                          <FormDescription>Number of transactions to generate (10-5000)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="options.start_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
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
                                    {field.value ? format(field.value, "PP") : "Start date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
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
                        name="options.end_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
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
                                    {field.value ? format(field.value, "PP") : "End date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-sm font-medium">Account Types to Include</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="options.include_deposits"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Bank Accounts</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="options.include_payments"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Credit Cards</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="options.include_investments"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Investments</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="options.include_loans"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Loans</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

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
                  
                  {errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                      <p className="font-medium">Generation Error:</p>
                      <p>{errorMessage}</p>
                    </div>
                  )}
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

      <TabsContent value="results">
        {generatedData && (
          <>
            {validationResults && (
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Validation Results</CardTitle>
                    <CardDescription>
                      Quality check results for the generated financial data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                          validationResults.valid 
                            ? "bg-green-100 text-green-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {validationResults.valid ? "✓" : "!"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {validationResults.valid 
                              ? "Data passed validation" 
                              : "Data has validation issues"}
                          </p>
                        </div>
                      </div>

                      {validationResults.errors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                          <p className="font-medium mb-1">Errors:</p>
                          <ul className="list-disc pl-5">
                            {validationResults.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validationResults.warnings.length > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm">
                          <p className="font-medium mb-1">Warnings:</p>
                          <ul className="list-disc pl-5">
                            {validationResults.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {dataStats && (
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Statistics</CardTitle>
                    <CardDescription>
                      Summary metrics for the generated financial data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Accounts</p>
                        <p className="text-2xl font-bold">{dataStats.totalAccounts}</p>
                        <div className="mt-2">
                          {Object.entries(dataStats.accountTypes).map(([type, count]) => (
                            <div key={type} className="flex justify-between text-sm">
                              <span className="capitalize">{type}</span>
                              <span>{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-2xl font-bold">{dataStats.totalTransactions}</p>
                        <p className="text-sm mt-1">
                          Average amount: ${dataStats.averageTransactionAmount.toFixed(2)}
                        </p>
                        <p className="text-sm">
                          Total volume: ${dataStats.transactionVolume.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Time Distribution</p>
                        <div className="mt-2 max-h-24 overflow-y-auto">
                          {Object.entries(dataStats.transactionsByMonth)
                            .sort((a, b) => a[0].localeCompare(b[0]))
                            .map(([month, count]) => (
                              <div key={month} className="flex justify-between text-sm">
                                <span>{month}</span>
                                <span>{count}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <GeneratedData data={generatedData} />
            
            <div className="mt-6 mb-2">
              <h3 className="text-lg font-medium mb-2">Integration Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Preview of the integrated data based on your configuration
              </p>
              <div className="border rounded-md">
                <Tabs defaultValue="json">
                  <div className="flex items-center border-b">
                    <TabsList className="bg-transparent p-0 h-9">
                      <TabsTrigger
                        value="summary"
                        className="rounded-none data-[state=active]:shadow-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 h-9"
                      >
                        Summary
                      </TabsTrigger>
                      <TabsTrigger
                        value="excel"
                        className="rounded-none data-[state=active]:shadow-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 h-9"
                      >
                        Excel
                      </TabsTrigger>
                      <TabsTrigger
                        value="json"
                        className="rounded-none data-[state=active]:shadow-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 h-9 font-medium"
                      >
                        JSON
                      </TabsTrigger>
                      <TabsTrigger
                        value="sql"
                        className="rounded-none data-[state=active]:shadow-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 h-9"
                      >
                        SQL
                      </TabsTrigger>
                    </TabsList>
                    <div className="ml-auto mr-2 flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-muted h-7 w-7 my-1"
                        onClick={() => handleCopyToClipboard()}
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-muted h-7 w-7 my-1"
                        onClick={() => handleDownload()}
                        title="Download JSON"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <TabsContent value="summary" className="p-0 m-0">
                    <div className="p-4 text-sm h-[400px] overflow-auto bg-background text-foreground">
                      <p>Summary view of the generated data will be displayed here.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="excel" className="p-0 m-0">
                    <div className="p-4 text-sm h-[400px] overflow-auto bg-background text-foreground">
                      <p>Excel format preview will be displayed here.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="json" className="p-0 m-0">
                    <pre className="p-4 overflow-auto text-xs h-[400px] bg-background text-foreground m-0 rounded-none">
                      <code>{formatSampleData()}</code>
                    </pre>
                  </TabsContent>
                  
                  <TabsContent value="sql" className="p-0 m-0">
                    <div className="p-4 text-sm h-[400px] overflow-auto bg-background text-foreground">
                      <p>SQL format preview will be displayed here.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  )
}

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
