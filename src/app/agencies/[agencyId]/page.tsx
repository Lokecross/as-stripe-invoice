"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PencilIcon, UserIcon, FileTextIcon } from 'lucide-react'

// Mock data
const agencyData = {
  name: "Acme Agency",
  logo: "/placeholder.svg?height=100&width=100",
  workers: [
    { id: 1, name: "John Doe", role: "Designer", email: "john@acme.com" },
    { id: 2, name: "Jane Smith", role: "Developer", email: "jane@acme.com" },
    { id: 3, name: "Mike Johnson", role: "Project Manager", email: "mike@acme.com" },
  ],
  invoices: [
    { id: 1, number: "INV-001", client: "Client A", amount: 1000, status: "Paid" },
    { id: 2, number: "INV-002", client: "Client B", amount: 1500, status: "Pending" },
    { id: 3, number: "INV-003", client: "Client C", amount: 2000, status: "Overdue" },
  ],
}

export default function AgencyDetails({ params }: { params: { agencyId: string } }) {
  const [agency, setAgency] = useState(agencyData)

  const handleEditTemplate = () => {
    console.log("Edit invoice template")
    // Implement edit template functionality here
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
            <img src={agency.logo} alt={`${agency.name} logo`} className="w-16 h-16 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">{agency.name}</h2>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleEditTemplate}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Invoice Template
            </Button>
          </CardFooter>
        </Card>

        {/* Workers List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Workers</CardTitle>
            <CardDescription>List of agency workers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agency.workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{worker.role}</TableCell>
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agency.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.number}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
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