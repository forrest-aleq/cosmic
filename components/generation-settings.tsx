"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  transactionDensity: z.number().min(0.1).max(2),
  includeRandomErrors: z.boolean(),
  dateRange: z.string(),
  seasonalPattern: z.string(),
  outputFormat: z.string(),
  transactionVariability: z.number().min(0.1).max(2),
})

export function GenerationSettings() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionDensity: 1,
      includeRandomErrors: false,
      dateRange: "founding-to-present",
      seasonalPattern: "auto",
      outputFormat: "csv",
      transactionVariability: 1,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Settings saved",
      description: "Your generation settings have been updated.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Settings</CardTitle>
        <CardDescription>Configure how financial data is generated</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="general">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select date range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="founding-to-present">Founding to Present</SelectItem>
                            <SelectItem value="last-year">Last Year</SelectItem>
                            <SelectItem value="last-3-years">Last 3 Years</SelectItem>
                            <SelectItem value="last-5-years">Last 5 Years</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Time period for generated financial data</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seasonalPattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seasonal Pattern</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select seasonal pattern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="auto">Auto (Based on Industry)</SelectItem>
                            <SelectItem value="consistent">Consistent</SelectItem>
                            <SelectItem value="quarterly">Quarterly Peaks</SelectItem>
                            <SelectItem value="holiday">Holiday Season</SelectItem>
                            <SelectItem value="summer">Summer Peak</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How transaction volume varies throughout the year</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="transactions">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="transactionDensity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Density: {field.value.toFixed(1)}x</FormLabel>
                        <FormControl>
                          <Slider
                            min={0.1}
                            max={2}
                            step={0.1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormDescription>Multiplier for the number of transactions generated</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transactionVariability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Variability: {field.value.toFixed(1)}x</FormLabel>
                        <FormControl>
                          <Slider
                            min={0.1}
                            max={2}
                            step={0.1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormDescription>How much transaction amounts vary</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeRandomErrors"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Include Random Errors</FormLabel>
                          <FormDescription>
                            Add occasional errors like duplicate transactions or misclassifications
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="output">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="outputFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Output Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select output format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>File format for generated financial data</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  )
}

