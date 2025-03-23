"use client"

import { useState } from "react"
import { FileJson, FileSpreadsheet, DownloadCloud, Info } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TransactionTable } from "@/components/transaction-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Account, Transaction, PlaidTransactionsResponse } from "@/types/plaid-types"

interface GeneratedDataProps {
  data: PlaidTransactionsResponse
}

export function GeneratedData({ data }: GeneratedDataProps) {
  const [activeTab, setActiveTab] = useState("summary")

  if (!data) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No data available. Please generate data first.</AlertDescription>
      </Alert>
    )
  }

  // Get account names for display purposes
  const accountNames: Record<string, string> = {}
  data.accounts.forEach((account) => {
    accountNames[account.account_id] = account.name
  })

  // Count all transactions
  const transactionCount = data.added.length + data.modified.length

  // Calculate totals
  const depositoryAccounts = data.accounts.filter((account) => account.type === "depository")
  const creditAccounts = data.accounts.filter((account) => account.type === "credit")
  
  const depositoryBalance = depositoryAccounts.reduce(
    (total, account) => total + account.balances.current,
    0
  )
  
  const creditBalance = creditAccounts.reduce(
    (total, account) => total + account.balances.current,
    0
  )

  // Group transactions by account
  const transactionsByAccount: Record<string, Transaction[]> = {}
  
  data.added.concat(data.modified).forEach((transaction) => {
    if (!transactionsByAccount[transaction.account_id]) {
      transactionsByAccount[transaction.account_id] = []
    }
    transactionsByAccount[transaction.account_id].push(transaction)
  })

  // Helper function to download data as JSON
  const downloadJson = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Helper function to download data as CSV
  const downloadCsv = (transactions: Transaction[], filename: string) => {
    // Convert transactions to CSV format
    const headers = ["Date", "Description", "Amount", "Category", "Payment Method"]
    
    const rows = transactions.map((t) => [
      t.date,
      t.name,
      t.amount.toString(),
      t.category ? t.category[t.category.length - 1] : "",
      t.payment_meta?.payment_method || ""
    ])
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Generated Financial Data</h2>
        <Button variant="outline" onClick={() => downloadJson(data, "financial_data.json")}>
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download All Data
        </Button>
      </div>

      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="accounts">All Accounts</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.accounts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {depositoryAccounts.length} bank accounts, {creditAccounts.length} credit cards
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionCount}</div>
                <p className="text-xs text-muted-foreground">
                  {data.added.length} added, {data.modified.length} modified
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Bank:</span>{" "}
                    <span className="text-lg font-bold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(depositoryBalance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Credit:</span>{" "}
                    <span className="text-lg font-bold text-red-500">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(creditBalance)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>All financial accounts and their current balances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bank Accounts</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {depositoryAccounts.map((account) => (
                    <div key={account.account_id} className="rounded-md border p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-medium">{account.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {account.official_name || account.subtype}
                            {account.mask && <span> •••• {account.mask}</span>}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {account.subtype}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium">Available:</div>
                        <div className="text-lg font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: account.balances.iso_currency_code,
                          }).format(account.balances.available || 0)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium">Current:</div>
                        <div className="text-lg font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: account.balances.iso_currency_code,
                          }).format(account.balances.current)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Credit Cards</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {creditAccounts.map((account) => (
                    <div key={account.account_id} className="rounded-md border p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-medium">{account.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {account.official_name || account.subtype}
                            {account.mask && <span> •••• {account.mask}</span>}
                          </p>
                        </div>
                        <Badge variant="outline">Credit Card</Badge>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium">Balance:</div>
                        <div className="text-lg font-bold text-red-500">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: account.balances.iso_currency_code,
                          }).format(account.balances.current)}
                        </div>
                      </div>
                      {account.balances.limit && (
                        <div className="mt-2">
                          <div className="text-sm font-medium">Credit Limit:</div>
                          <div className="text-lg font-bold">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: account.balances.iso_currency_code,
                            }).format(account.balances.limit)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Transaction history for all accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv(data.added.concat(data.modified), "all_transactions.csv")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJson(data.added.concat(data.modified), "all_transactions.json")}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON
                </Button>
              </div>
              
              <TransactionTable 
                transactions={data.added.concat(data.modified)} 
                accountNames={accountNames}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
