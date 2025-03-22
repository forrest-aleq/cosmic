"use client"

import { useState } from "react"
import { FileJson, FileSpreadsheet, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyProfile } from "@/components/company-profile"
import { TransactionTable } from "@/components/transaction-table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GeneratedDataProps {
  data: any
}

export function GeneratedData({ data }: GeneratedDataProps) {
  const [activeTab, setActiveTab] = useState("profile")

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadCsv = (data: any[], filename: string) => {
    if (!data.length) return

    // Get headers from first object
    const headers = Object.keys(data[0])

    // Convert data to CSV
    const csvRows = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            // Handle values that need quotes (commas, quotes, etc.)
            const value = row[header]
            const valueStr = String(value)
            return valueStr.includes(",") || valueStr.includes('"') || valueStr.includes("\n")
              ? `"${valueStr.replace(/"/g, '""')}"`
              : valueStr
          })
          .join(","),
      ),
    ]

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Calculate total transaction counts
  const getTotalTransactions = (statements: Record<string, any[]>) => {
    return Object.values(statements).reduce((total, transactions) => total + transactions.length, 0)
  }

  const bankTransactionCount = getTotalTransactions(data.bank_statements)
  const creditTransactionCount = getTotalTransactions(data.credit_statements)
  const totalTransactionCount = bankTransactionCount + creditTransactionCount

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Generated Data</h2>
          <p className="text-muted-foreground">
            {totalTransactionCount.toLocaleString()} total transactions across{" "}
            {Object.keys(data.bank_statements).length} bank accounts and {Object.keys(data.credit_statements).length}{" "}
            credit cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadJson(data, "company_data.json")}>
            <FileJson className="mr-2 h-4 w-4" />
            Download All (JSON)
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="bank">
            Bank Statements
            <Badge variant="secondary" className="ml-2">
              {bankTransactionCount.toLocaleString()}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="credit">
            Credit Card Statements
            <Badge variant="secondary" className="ml-2">
              {creditTransactionCount.toLocaleString()}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 md:grid-cols-2">
            <CompanyProfile profile={data.profile} />

            <Card>
              <CardHeader>
                <CardTitle>Download Options</CardTitle>
                <CardDescription>Export your company profile data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => downloadJson(data.profile, "company_profile.json")}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  Download Profile (JSON)
                </Button>

                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4" />
                    <h3 className="font-medium">Data Summary</h3>
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li>Company: {data.profile.company_name}</li>
                    <li>Bank Accounts: {Object.keys(data.bank_statements).length}</li>
                    <li>Credit Cards: {Object.keys(data.credit_statements).length}</li>
                    <li>Total Transactions: {totalTransactionCount.toLocaleString()}</li>
                    <li>Date Range: 2 years of transaction history</li>
                    <li>Generated: {new Date().toLocaleString()}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Statements</CardTitle>
              <CardDescription>Transaction history for all bank accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(data.bank_statements)[0]} className="space-y-4">
                <TabsList className="w-full flex flex-wrap">
                  {Object.entries(data.bank_statements).map(([account, transactions]) => (
                    <TabsTrigger key={account} value={account} className="flex-1">
                      {account}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="ml-2">
                              {transactions.length}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>{transactions.length} transactions</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(data.bank_statements).map(([account, transactions]) => (
                  <TabsContent key={account} value={account}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{account}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadCsv(transactions as any[], `bank_${account.replace(/\s+/g, "_")}.csv`)
                            }
                          >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadJson(transactions, `bank_${account.replace(/\s+/g, "_")}.json`)}
                          >
                            <FileJson className="mr-2 h-4 w-4" />
                            JSON
                          </Button>
                        </div>
                      </div>

                      <TransactionTable transactions={transactions as any[]} />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle>Credit Card Statements</CardTitle>
              <CardDescription>Transaction history for all credit cards</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(data.credit_statements)[0]} className="space-y-4">
                <TabsList className="w-full flex flex-wrap">
                  {Object.entries(data.credit_statements).map(([card, transactions]) => (
                    <TabsTrigger key={card} value={card} className="flex-1">
                      {card}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="ml-2">
                              {transactions.length}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>{transactions.length} transactions</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(data.credit_statements).map(([card, transactions]) => (
                  <TabsContent key={card} value={card}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{card}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadCsv(transactions as any[], `credit_${card.replace(/\s+/g, "_")}.csv`)
                            }
                          >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadJson(transactions, `credit_${card.replace(/\s+/g, "_")}.json`)}
                          >
                            <FileJson className="mr-2 h-4 w-4" />
                            JSON
                          </Button>
                        </div>
                      </div>

                      <TransactionTable transactions={transactions as any[]} />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

