"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { Transaction } from "@/types/plaid-types"

interface TransactionTableProps {
  transactions: Transaction[]
  accountNames?: Record<string, string>
}

export function TransactionTable({ transactions, accountNames = {} }: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(25)

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
      accessorKey: "name",
      header: "Description",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="max-w-[300px]">
            <div className="font-medium truncate">{row.getValue("name")}</div>
            {transaction.merchant_name && transaction.merchant_name !== row.getValue("name") && (
              <div className="text-xs text-muted-foreground truncate">{transaction.merchant_name}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "account_id",
      header: "Account",
      cell: ({ row }) => {
        const accountId = row.getValue("account_id") as string
        const accountName = accountNames[accountId] || accountId.slice(0, 8) + "..."
        return <div className="whitespace-nowrap">{accountName}</div>
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const categories = row.original.category || []
        if (categories.length === 0) return null
        return (
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="whitespace-nowrap text-xs">
              {categories[categories.length - 1]}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Math.abs(amount))

        return <div className={amount > 0 ? "text-red-500" : "text-green-500"}>{formatted}</div>
      },
    },
    {
      accessorKey: "payment_meta.payment_method",
      header: "Payment Method",
      cell: ({ row }) => {
        const paymentMethod = row.original.payment_meta?.payment_method
        return paymentMethod ? <div className="capitalize">{paymentMethod}</div> : null
      },
    },
  ]

  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
  })

  // Get unique categories for filtering
  const uniqueCategories = Array.from(
    new Set(
      transactions.flatMap(t => 
        t.category?.length ? t.category[t.category.length - 1] : []
      )
    )
  ).filter(Boolean)

  // Get unique payment methods
  const uniquePaymentMethods = Array.from(
    new Set(
      transactions.map(t => t.payment_meta?.payment_method).filter(Boolean)
    )
  ) as string[]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Filter descriptions..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          {table.getColumn("category") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Category <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                <DropdownMenuCheckboxItem
                  checked={!table.getColumn("category")?.getFilterValue()}
                  onCheckedChange={() => table.getColumn("category")?.setFilterValue(undefined)}
                >
                  All Categories
                </DropdownMenuCheckboxItem>
                {uniqueCategories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={table.getColumn("category")?.getFilterValue() === category}
                    onCheckedChange={() => {
                      if (table.getColumn("category")?.getFilterValue() === category) {
                        table.getColumn("category")?.setFilterValue(undefined)
                      } else {
                        table.getColumn("category")?.setFilterValue(category)
                      }
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {table.getColumn("payment_meta.payment_method") && uniquePaymentMethods.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Payment Method <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={!table.getColumn("payment_meta.payment_method")?.getFilterValue()}
                  onCheckedChange={() => table.getColumn("payment_meta.payment_method")?.setFilterValue(undefined)}
                >
                  All Methods
                </DropdownMenuCheckboxItem>
                {uniquePaymentMethods.map((method) => (
                  <DropdownMenuCheckboxItem
                    key={method}
                    checked={table.getColumn("payment_meta.payment_method")?.getFilterValue() === method}
                    onCheckedChange={() => {
                      if (table.getColumn("payment_meta.payment_method")?.getFilterValue() === method) {
                        table.getColumn("payment_meta.payment_method")?.setFilterValue(undefined)
                      } else {
                        table.getColumn("payment_meta.payment_method")?.setFilterValue(method)
                      }
                    }}
                  >
                    <span className="capitalize">{method}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number.parseInt(value))
              table.setPageSize(Number.parseInt(value))
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
              <SelectItem value="250">250 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {table.getFilteredRowModel().rows.length > 0
            ? `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}`
            : "0"}{" "}
          of {table.getFilteredRowModel().rows.length} transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  )
}
