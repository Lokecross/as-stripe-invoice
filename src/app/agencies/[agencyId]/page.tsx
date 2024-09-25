"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PencilIcon, EyeIcon } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Logo%3C/text%3E%3C/svg%3E"

export default function AgencyDetails({ params }: { params: { agencyId: string } }) {
  const [agency, setAgency] = useState<any>(null)
  const [workers, setWorkers] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const { toast } = useToast()

  const fetchAgencyData = async () => {
    try {
      const agencyResponse = await fetch(`/api/agencies/${params.agencyId}`)
      const agencyData = await agencyResponse.json()
      setAgency(agencyData)

      const workersResponse = await fetch(`/api/agencies/${params.agencyId}/workers`)
      const workersData = await workersResponse.json()
      setWorkers(workersData)

      const invoicesResponse = await fetch(`/api/agencies/${params.agencyId}/invoices`)
      const invoicesData = await invoicesResponse.json()
      setInvoices(invoicesData)
    } catch (error) {
      console.error('Error fetching agency data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch agency data. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchAgencyData()
  }, [params.agencyId])

  const handleWorkerSelection = (workerId: string) => {
    setSelectedWorkers(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    )
  }

  const handleGenerateInvoices = async () => {
    if (selectedWorkers.length === 0) {
      toast({
        title: "No workers selected",
        description: "Please select at least one worker to generate invoices.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/agencies/${params.agencyId}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerIds: selectedWorkers }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Invoice Generation Complete",
          description: `Successfully generated ${result.generatedInvoices.length} invoice(s) out of ${result.totalWorkers} selected worker(s).${result.errors.length > 0 ? ` ${result.errors.length} error(s) occurred.` : ''}`,
        })
        // Refresh the data
        await fetchAgencyData()
        // Clear selection
        setSelectedWorkers([])
      } else {
        throw new Error(result.error || 'Failed to generate invoices')
      }
    } catch (error) {
      console.error('Error generating invoices:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate invoices. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewInvoice = async (fileName: string) => {
    try {
      const response = await fetch(`/invoices/${fileName}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
      } else {
        throw new Error('Invoice not found')
      }
    } catch (error) {
      console.error('Error viewing invoice:', error)
      toast({
        title: "Error",
        description: "Failed to view invoice. The file may not exist or be accessible.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/agencies/${params.agencyId}/invoices`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId, status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: "Invoice status has been successfully updated.",
        })
        // Refresh the invoices data
        const invoicesResponse = await fetch(`/api/agencies/${params.agencyId}/invoices`)
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData)
      } else {
        throw new Error('Failed to update invoice status')
      }
    } catch (error) {
      console.error('Error updating invoice status:', error)
      toast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!agency) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="grid gap-6">
        {/* Agency Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <img src={agency.logo || placeholderImage} alt={`${agency.name} logo`} className="w-16 h-16 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">{agency.name}</h2>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/agencies/${params.agencyId}/template`}>
              <Button variant="outline">
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Invoice Template
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Workers List Card */}
        <Card>
          <CardHeader>
            <div className='flex justify-between'>
              <div>
                <CardTitle>Workers</CardTitle>
                <CardDescription>List of agency workers</CardDescription>
              </div>
              <Button variant="secondary" onClick={handleGenerateInvoices} disabled={selectedWorkers.length === 0}>
                Generate Invoices
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Worked Hours</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker._id}>
                    <TableCell className='flex items-center gap-3'>
                      <Checkbox
                        checked={selectedWorkers.includes(worker._id)}
                        onCheckedChange={() => handleWorkerSelection(worker._id)}
                      />
                      {worker.name}
                    </TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>{worker.workedHours || 0}</TableCell>
                    <TableCell>${worker.hourlyRate || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoices Card */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Recent invoices issued by the agency</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>{invoice._id}</TableCell>
                    <TableCell>{invoice.worker.name}</TableCell>
                    <TableCell>${invoice.amount}</TableCell>
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={invoice.status}
                        onValueChange={(value) => handleStatusChange(invoice._id, value)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewInvoice(invoice.fileName)}>
                        <EyeIcon className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}