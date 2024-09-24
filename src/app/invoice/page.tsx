"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DownloadIcon, PlusIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'

interface Invoice {
  _id: string
  fileName: string
  invoiceNumber: string
  customerName: string
  total: number
  createdAt: string
}

export default function InvoiceListingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    // Fetch invoices from API
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoice')
        const data = await response.json()
        setInvoices(data.invoices)
      } catch (error) {
        console.error('Failed to fetch invoices:', error)
      }
    }

    fetchInvoices()
  }, [])

  const handleDownload = (fileName: string) => {
    // Open a new tab with the download URL
    window.open(`/invoices/${fileName}`, '_blank');
  };

  const handleDelete = async (invoiceId: string) => {
    // Implement delete logic
    try {
      await fetch(`/api/invoice/${invoiceId}`, { method: 'DELETE' })
      setInvoices(invoices.filter(invoice => invoice._id !== invoiceId))
    } catch (error) {
      console.error('Failed to delete invoice:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-6">
            <CardTitle>Invoices</CardTitle>
            <Link href="/new-invoice">
                <Button variant="outline" size="sm" className="ml-2">
                    <PlusIcon className="mr-2 h-4 w-4" /> New Invoice
                </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>{invoice._id}</TableCell>
                <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice.fileName)}>
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(invoice._id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}