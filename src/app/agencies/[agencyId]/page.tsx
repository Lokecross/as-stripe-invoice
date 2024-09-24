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
import { PencilIcon } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Logo%3C/text%3E%3C/svg%3E"

export default function AgencyDetails({ params }: { params: { agencyId: string } }) {
  const [agency, setAgency] = useState<any>(null)
  const [workers, setWorkers] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
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
      }
    }

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

      if (response.ok) {
        toast({
          title: "Invoices generated",
          description: `Successfully generated invoices for ${selectedWorkers.length} worker(s).`,
        })
        // Refresh the invoices list
        const invoicesResponse = await fetch(`/api/agencies/${params.agencyId}/invoices`)
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData)
        // Clear selection
        setSelectedWorkers([])
      } else {
        throw new Error('Failed to generate invoices')
      }
    } catch (error) {
      console.error('Error generating invoices:', error)
      toast({
        title: "Error",
        description: "Failed to generate invoices. Please try again.",
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
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>{invoice._id}</TableCell>
                    <TableCell>{invoice.worker.name}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
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